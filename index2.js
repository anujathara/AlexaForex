{
    "event": {
      "header": {
        "namespace": "Alexa.Discovery",
        "name": "Discover.Response",
        "payloadVersion": "3",
        "messageId": "Unique identifier, preferably a version 4 UUID"
      },
      "payload": {
        "endpoints": [
          {
            "endpointId": "Unique ID of the endpoint",
            "manufacturerName": "Fan manufacturer name",
            "description": "description that appears in the Alexa app",
            "friendlyName": "device name that appears in the Alexa app",
            "displayCategories": ["FAN"],
            "additionalAttributes":  {
              "manufacturer" : "Fan manufacturer name",
              "model" : "Sample Model",
              "serialNumber": "the serial number",
              "customIdentifier": "your custom identifier"
            },
            "cookie": {},
            "capabilities": [
              {
                "type": "AlexaInterface",
                "interface": "Alexa.RangeController",
                "instance": "Fan.Speed",
                "version": "3",
                "properties": {
                  "supported": [
                    {
                      "name": "rangeValue"
                    }
                  ],
                  "proactivelyReported": true,
                  "retrievable": true,
                  "nonControllable": false
                },
                "capabilityResources": {
                  "friendlyNames": [
                    {
                      "@type": "asset",
                      "value": {
                        "assetId": "Alexa.Setting.FanSpeed"
                      }
                    },
                    {
                      "@type": "text",
                      "value": {
                        "text": "Speed",
                        "locale": "en-US"
                      }
                    },
                    {
                      "@type": "text",
                      "value": {
                        "text": "Velocidad",
                        "locale": "es-MX"
                      }
                    },
                    {
                      "@type": "text",
                      "value": {
                        "text": "Vitesse",
                        "locale": "fr-CA"
                      }
                    }
                  ]
                },
                "configuration": {
                  "supportedRange": {
                    "minimumValue": 1,
                    "maximumValue": 10,
                    "precision": 1
                  },
                  "presets": [
                    {
                      "rangeValue": 10,
                      "presetResources": {
                        "friendlyNames": [
                          {
                            "@type": "asset",
                            "value": {
                              "assetId": "Alexa.Value.Maximum"
                            }
                          },
                          {
                            "@type": "asset",
                            "value": {
                              "assetId": "Alexa.Value.High"
                            }
                          },
                          {
                            "@type": "text",
                            "value": {
                              "text": "Highest",
                              "locale": "en-US"
                            }
                          },
                          {
                            "@type": "text",
                            "value": {
                              "text": "Fast",
                              "locale": "en-US"
                            }
                          },
                          {
                            "@type": "text",
                            "value": {
                              "text": "Alta",
                              "locale": "es-MX"
                            }
                          },
                          {
                            "@type": "text",
                            "value": {
                              "text": "Élevée",
                              "locale": "fr-CA"
                            }
                          }
                        ]
                      }
                    },
                    {
                      "rangeValue": 1,
                      "presetResources": {
                        "friendlyNames": [
                          {
                            "@type": "asset",
                            "value": {
                              "assetId": "Alexa.Value.Minimum"
                            }
                          },
                          {
                            "@type": "asset",
                            "value": {
                              "assetId": "Alexa.Value.Low"
                            }
                          },
                          {
                            "@type": "text",
                            "value": {
                              "text": "Lowest",
                              "locale": "en-US"
                            }
                          },
                          {
                            "@type": "text",
                            "value": {
                              "text": "Slow",
                              "locale": "en-US"
                            }
                          },
                          {
                            "@type": "text",
                            "value": {
                              "text": "Baja",
                              "locale": "es-MX"
                            }
                          },
                          {
                            "@type": "text",
                            "value": {
                              "text": "Faible",
                              "locale": "fr-CA"
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              {
                "type": "AlexaInterface",
                "interface": "Alexa.PowerController",
                "version": "3",
                "properties": {
                  "supported": [
                    {
                      "name": "powerState"
                    }
                  ],
                  "proactivelyReported": true,
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
      }
    }
  }