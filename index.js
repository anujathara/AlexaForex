// -*- coding: utf-8 -*-

// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License (the "License")
// You may not use this file except in compliance with the License.
// A copy of the License is located at http://aws.amazon.com/asl/
//
// This file is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific
// language governing permissions and limitations under the License.

const axios = require('axios');
const util = require('util');
const AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = function (request, context) {
    // const clientId = 'amzn1.application-oa2-client.0fdf8073313c4275a347de9f5d8b44c5';
    // const clientSecret = 'amzn1.oa2-cs.v1.5e675c6446a6fc58a79f665533064cef5405449feba761382b5fd8706fbd26b2';
    const clientId = 'amzn1.application-oa2-client.7ac7bac140c74ebf90d432f1bcac9ec9';
    const clientSecret = 'amzn1.oa2-cs.v1.f9fbdc963a618798ba936c0cc6e4b44300dc89d9e8520b19c7a823d359b4d1b2';
    const tokenEndpoint = 'https://api.amazon.com/auth/o2/token';
    const eventGatewayEndpoint = 'https://api.eu.amazonalexa.com/v3/events';
    let forexRate = '';
    const forexHighTriggerRate = 101.92;

        if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
            log("DEBUG:", "Discover request", JSON.stringify(request));
            handleDiscovery(request, context, "");
        }
        else if (request.directive.header.namespace === 'Alexa.PowerController') {
            if (request.directive.header.name === 'TurnOn' || request.directive.header.name === 'TurnOff') {
                log("DEBUG:", "TurnOn or TurnOff Request", JSON.stringify(request));
                handlePowerControl(request, context);
            }
        }
        else if (request.directive.header.namespace === 'Alexa.Authorization' && request.directive.header.name === 'AcceptGrant') {
            handleAuthorization(request, context)
        }
        else if (request.directive.header.namespace === 'Alexa.ContactSensor') {
            if (request.directive.header.name === 'Dhanu') {
                log("DEBUG:", "ChangeReport Request", JSON.stringify(request));
                handleChangeReport(request, context);
            }
        }
        else if (request.directive.header.namespace === 'Alexa.ContactSensor') {
            if (request.directive.header.name === 'StateReport') {
                log("DEBUG:", "StateReport Request", JSON.stringify(request));
                handleStateReport(request, context);
            }
        }
        else if (request.directive.header.namespace === 'GetForexRateEvent') {
            console.log('Event Received from Scheduler');
            getForexRate();
            return 'Success';
        }


    function handleAuthorization(request, context) {
        // Send the AcceptGrant response
        var payload = {};
        var header = request.directive.header;
        var authCode = request.directive.payload.grant.code;
        header.name = "AcceptGrant.Response";
        axios.post(tokenEndpoint, {
            'grant_type': 'authorization_code',
            'client_id': clientId,
            'client_secret': clientSecret,
            'code': authCode
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
        })
            .then(function (response) {
                console.log('First Token Received: ', response?.data);
                updateDynamoDbToken(response?.data);
                context.succeed({ event: { header: header, payload: payload } });
            })
            .catch(function (error) {
                console.log('First Token Request Error: ', error);
            });

        console.log("DEBUG", "AcceptGrant Response: ", JSON.stringify({ header: header, payload: payload }));
    }

    async function updateDynamoDbToken(data) {
        // Inserting item in dynamoDB
        const params = {
            TableName: 'AlexaSkillsToken',
            Item: {
                UserName: {
                    S: 'anujat06@gmail.com'
                },
                AccessToken: {
                    S: data?.access_token
                },
                RefreshToken: {
                    S: data?.refresh_token
                },
                ExpiresIn: {
                    N: String(data?.expires_in)
                },
                CreatedDate: {
                    S: String(new Date())
                }
            }
        };
        await dynamodb.putItem(params, function (err, data) {
            if (err) {
                console.log('Error Updating Token to Dynamodb: ' + err);
            }
            else {
                console.log('Token Update to Dynamodb Success: ' + JSON.stringify(data, null, '  '));
            }
        }).promise();
    }

    function handleDiscovery(request, context) {
        // Send the discovery response
        var payload = {
            "endpoints":
                [
                    {
                        "endpointId": "sample-bulb-01",
                        "manufacturerName": "Smart Device Company",
                        "friendlyName": "Forex",
                        "description": "Virtual smart light bulb",
                        "displayCategories": ["LIGHT"],
                        "additionalAttributes": {
                            "manufacturer": "Sample Manufacturer",
                            "model": "Sample Model",
                            "serialNumber": "U11112233456",
                            "firmwareVersion": "1.24.2546",
                            "softwareVersion": "1.036",
                            "customIdentifier": "Sample custom ID"
                        },
                        "cookie": {
                            "key1": "arbitrary key/value pairs for skill to reference this endpoint.",
                            "key2": "There can be multiple entries",
                            "key3": "but they should only be used for reference purposes. ",
                            "key4": "This is not a suitable place to maintain current endpoint state."
                        },
                        "capabilities":
                            [
                                {
                                    "interface": "Alexa.PowerController",
                                    "version": "3",
                                    "type": "AlexaInterface",
                                    "properties": {
                                        "supported": [{
                                            "name": "powerState"
                                        }],
                                        "retrievable": true
                                    }
                                },
                                {
                                    "type": "AlexaInterface",
                                    "interface": "Alexa.ContactSensor",
                                    "version": "3",
                                    "properties": {
                                        "supported": [
                                            {
                                                "name": "detectionState"
                                            }
                                        ],
                                        "proactivelyReported": true,
                                        "retrievable": true
                                    }
                                },
                                {
                                    "type": "AlexaInterface",
                                    "interface": "Alexa.EndpointHealth",
                                    "version": "3.2",
                                    "properties": {
                                        "supported": [{
                                            "name": "connectivity"
                                        }],
                                        "retrievable": true
                                    }
                                },
                                {
                                    "type": "AlexaInterface",
                                    "interface": "Alexa",
                                    "version": "3"
                                }
                            ]
                    }
                ]
        };
        var header = request.directive.header;
        header.name = "Discover.Response";
        log("DEBUG", "Discovery Response: ", JSON.stringify({ header: header, payload: payload }));
        context.succeed({ event: { header: header, payload: payload } });
    }

    function log(message, message1, message2) {
        console.log(message + message1 + message2);
    }

    function handlePowerControl(request, context) {
        // get device ID passed in during discovery
        var requestMethod = request.directive.header.name;
        var responseHeader = request.directive.header;
        responseHeader.namespace = "Alexa";
        responseHeader.name = "Response";
        responseHeader.messageId = responseHeader.messageId + "-R";
        // get user token pass in request
        var requestToken = request.directive.endpoint.scope.token;
        var powerResult;

        if (requestMethod === "TurnOn") {
            powerResult = "ON";
        }
        else if (requestMethod === "TurnOff") {
            powerResult = "OFF";
        }
        // Return the updated powerState.  Always include EndpointHealth in your Alexa.Response
        // Datetime format for timeOfSample is ISO 8601, `YYYY-MM-DDThh:mm:ssZ`.
        var contextResult = {
            "properties": [{
                "namespace": "Alexa.PowerController",
                "name": "powerState",
                "value": powerResult,
                "timeOfSample": "2022-09-03T16:20:50.52Z", //retrieve from result.
                "uncertaintyInMilliseconds": 50
            },
            {
                "namespace": "Alexa.EndpointHealth",
                "name": "connectivity",
                "value": {
                    "value": "OK"
                },
                "timeOfSample": "2022-09-03T22:43:17.877738+00:00",
                "uncertaintyInMilliseconds": 0
            }]
        };
        var response = {
            context: contextResult,
            event: {
                header: responseHeader,
                endpoint: {
                    scope: {
                        type: "BearerToken",
                        token: requestToken
                    },
                    endpointId: "sample-bulb-01"
                },
                payload: {}
            }
        };
        log("DEBUG", "Alexa.PowerController ", JSON.stringify(response));
        context.succeed(response);
    }

    function handleStateReport(request, context) {
        // get device ID passed in during discovery
        var responseHeader = request.directive.header;
        responseHeader.namespace = "Alexa";
        responseHeader.name = "StateReport";
        responseHeader.messageId = responseHeader.messageId + "-R";
        // get user token pass in request
        var requestToken = request.directive.endpoint.scope.token;

        // Return the updated powerState.  Always include EndpointHealth in your Alexa.Response
        // Datetime format for timeOfSample is ISO 8601, `YYYY-MM-DDThh:mm:ssZ`.
        var contextResult = {
            "properties": [{
                "namespace": "Alexa.ContactSensor",
                "name": "detectionState",
                "value": "DETECTED",
                "timeOfSample": "2017-02-03T16:20:50.52Z",
                "uncertaintyInMilliseconds": 0
            },
            {
                "namespace": "Alexa.EndpointHealth",
                "name": "connectivity",
                "value": {
                    "value": "OK"
                },
                "timeOfSample": "2022-09-03T22:43:17.877738+00:00",
                "uncertaintyInMilliseconds": 0
            }]
        };
        var response = {
            context: contextResult,
            event: {
                header: responseHeader,
                endpoint: {
                    scope: {
                        type: "BearerToken",
                        token: requestToken
                    },
                    endpointId: "sample-bulb-01"
                },
                payload: {}
            }
        };
        log("DEBUG", "Alexa.ContactSensor ", JSON.stringify(response));
        context.succeed(response);
    }

    function getForexRate() {
        axios.get('https://www.investing.com/currencies/gbp-inr')
            .then(function (response2) {
                var priceStr = 'instrument-price-last';
                var pos = response2.data.search('instrument-header-details');
                var startPos = response2.data.indexOf(priceStr, pos) + priceStr.length + 2;
                var endPos = response2.data.indexOf('</span>', startPos);
                forexRate = Number(response2.data.substring(startPos, endPos));
                console.log('Current Forex Rate ', forexRate);
                if (forexRate >= forexHighTriggerRate) {
                    console.log('Forex Triggered: ', forexRate);
                    handleChangeReport()
                }
            })
            .catch(function (error) {
                console.log('Error Pulling Forex Rate from Investing.com: ', error);
            });
    }

    async function handleChangeReport() {
        const request = {
            "directive": {
                "header": {
                    "namespace": "Alexa.ContactSensor",
                    "name": "Dhanu",
                    "messageId": "1bd5d003-31b9-476f-ad03-71d471922820",
                    "payloadVersion": "3"
                },
                "endpoint": {
                    "scope": {
                        "type": "BearerToken",
                        "token": "access-token-from-skill"
                    },
                    "endpointId": "sample-light-01",
                    "cookie": {}
                },
                "payload": {}
            }
        }

        log("DEBUG:", "Starting: ", JSON.stringify('Starting'));

        let refreshToken = '';
        let expiresIn = '';
        let createdDate = '';
        let accessToken = '';
        var params = {
            TableName: 'AlexaSkillsToken',
            Key: {
                'UserName': { S: 'anujat06@gmail.com' }
            },
            ProjectionExpression: 'RefreshToken, ExpiresIn, CreatedDate, AccessToken'
        };

        // Call DynamoDB to read the item from the table
        await dynamodb.getItem(params, function (err, data) {
            if (err) {
                console.log("Error Getting Token from Dynamodb: ", err);
            } else {
                refreshToken = data.Item.RefreshToken.S;
                expiresIn = data.Item.ExpiresIn.N;
                createdDate = data.Item.CreatedDate.S;
                accessToken = data.Item.AccessToken.S;
                console.log("Token Read from Dynamodb: ", refreshToken, expiresIn, createdDate, accessToken);
            }
        }).promise();

        let expireDate = new Date(new Date(createdDate).getTime() + (expiresIn * 1000));
        if (new Date() >= expireDate) {
            console.log('Token Expired, Token Created Date: ', createdDate, ' Token Expiry Date: ', expireDate);
            await axios.post(tokenEndpoint, {
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken,
                'client_id': clientId,
                'client_secret': clientSecret
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                }
            })
                .then(function (response) {
                    console.log('New Token Received: ', response?.data);
                    accessToken = response?.data?.access_token
                    updateDynamoDbToken(response?.data)

                })
                .catch(function (error) {
                    console.log('Error Getting New Token: ', error);
                });
        } else {
            console.log('Token Not Expired, Token Created Date: ', createdDate, ' Token Expiry Date: ', expireDate);
        }

        // get device ID passed in during discovery
        var responseHeader = request.directive.header;
        responseHeader.namespace = "Alexa";
        responseHeader.name = "ChangeReport";
        responseHeader.messageId = responseHeader.messageId + "-R";
        // get user token pass in request
        // var requestToken = request.directive.endpoint.scope.token;
        var requestToken = response?.data?.access_token;

        // Return the updated powerState.  Always include EndpointHealth in your Alexa.Response
        // Datetime format for timeOfSample is ISO 8601, `YYYY-MM-DDThh:mm:ssZ`.
        var contextResult = {
            "properties": [
                {
                    "namespace": "Alexa.EndpointHealth",
                    "name": "connectivity",
                    "value": {
                        "value": "OK"
                    },
                    "timeOfSample": "2022-09-03T22:43:17.877738+00:00",
                    "uncertaintyInMilliseconds": 0
                }]
        };
        var response = {
            context: contextResult,
            event: {
                header: responseHeader,
                endpoint: {
                    scope: {
                        type: "BearerToken",
                        token: accessToken
                    },
                    endpointId: "sample-bulb-01"
                },
                payload: {
                    "change": {
                        "cause": {
                            "type": "PHYSICAL_INTERACTION"
                        },
                        "properties": [
                            {
                                "namespace": "Alexa.ContactSensor",
                                "name": "detectionState",
                                "value": "DETECTED",
                                "timeOfSample": "2018-02-03T16:20:50.52Z",
                                "uncertaintyInMilliseconds": 0
                            }
                        ]
                    }
                }
            }
        };
        log("DEBUG", "Alexa.ContactSensor ", JSON.stringify(response));

        const gateway_data = JSON.stringify(response).toString('utf8');
        const access_token = util.format('Basic %s', accessToken);
        axios.post(eventGatewayEndpoint,
            gateway_data,
            {
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Authorization': access_token
                }
            })
            .then(function (response2) {
                console.log('Event Send to Alexa: ', response2);
            })
            .catch(function (error) {
                console.log('Error Event Send to Alexa: ', error);
            });
    }
};
