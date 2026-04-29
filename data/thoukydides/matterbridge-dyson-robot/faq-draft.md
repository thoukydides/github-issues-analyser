# Frequently Asked Questions (FAQ)

<!-- TOC-START -->
- **[Unsupported Dyson Devices and Features](#unsupported-dyson-devices-and-features)**
  - [Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?](#why-does-the-plugin-fail-to-start-with-an-unexpected-structure-of-dyson-cloud-api-response-error)
  - [What information should I collect to enable support for a new Dyson models?](#what-information-should-i-collect-to-enable-support-for-a-new-dyson-models)
  - [Why are Dyson error codes and the sleep timer not visible in my Matter controller?](#why-are-dyson-error-codes-and-the-sleep-timer-not-visible-in-my-matter-controller)
  - [Why isn't my Dyson Solarcycle Morph desk light supported?](#why-isnt-my-dyson-solarcycle-morph-desk-light-supported)
- **[Matterbridge](#matterbridge)**
  - [Why does `matterbridge-dyson-robot` report an older version in logs after an update?](#why-does-matterbridge-dyson-robot-report-an-older-version-in-logs-after-an-update)
- **[Appliance Discovery and Filtering](#appliance-discovery-and-filtering)**
<!-- TOC-END -->

## Unsupported Dyson Devices and Features

#### Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?

The `Unexpected structure of Dyson cloud API response` error occurs because the plugin performs strict validation of all data received from the MyDyson cloud API. This is a deliberate design choice to ensure that any changes to the API or the introduction of new appliance capabilities are identified and correctly implemented rather than silently ignored. When Dyson releases a new model or a firmware update that includes data fields or values that the plugin does not yet recognise, the validation fails and prevents the plugin from starting.

To resolve this, ensure you are running the latest version of the plugin, as support for new device capabilities and structural variations is frequently added. If the error persists, please check the logs for the specific validation failure and provide a full debug log in a GitHub issue so the new API structures can be correctly mapped.

#### What information should I collect to enable support for a new Dyson models?

<!-- INCLUDES: issue-16-b67c -->
Most Dyson connected products use MQTT messages to control their basic functionality and provide status. Please use the `opendyson` tool to capture a full MQTT message log whilst exercising as much of the device's functionality as possible, e.g. adjusting every setting of an air purifier or performing a full clean with a robot vacuum:

1. Install `opendyson`, e.g. if `Go` is installed and configured:  
   `go install github.com/libdyson-wg/opendyson`
2. Login to your MyDyson account:  
   `opendyson login`
3. Identify devices and retrieve their connection credentials:  
   `opendyson devices`
4. Capture an MQTT message log:  
   `opendyson listen SERIALNUMBER` (with the device's actual serial number substituted)
5. Paste or attach the output of `opendyson devices` and `opendyson listen` into the **Additional Information** section of the issue (as text, not a screenshot).

Dyson robot vacuums perform many operations (such as controlling zone cleaning and viewing cleaned area maps) via the MyDyson API instead of using MQTT messages. Please use a tool like Proxyman to capture examples of these HTTPS requests and their responses:

1. Install [Proxyman](https://apps.apple.com/gb/app/proxyman/id1551292695). (The free edition is sufficient.) 
2. Run `Proxyman`, and on its **More** tab follow the instructions to install and trust the root certificate. 
3. Under **SSL Proxying List** add `appapi.cp.dyson.com` and enable it. 
4. Start the VPN and ensure `Ready to intercept` is displayed.
5. Launch the MyDyson app and select `appapi.cp.dyson.com` in Proxyman. 
6. Switch back to the MyDyson app and try all basic functionality (power levels, "All areas" clean, zone cleaning, and viewing maps).
7. Return to Proxyman, click on the cog icon, select **Share**, and then **Save to Files**. Attach the resulting `.proxymanlogv2` file to the issue.

#### Why are Dyson error codes and the sleep timer not visible in my Matter controller?

<!-- INCLUDES: issue-1-4ad6 -->
Dyson appliances report internal status, specific fault codes (such as `51C2`, `ercd`, `ste1`, or `iuh3`), and sleep timer data (`sltm`) via their MQTT stream. While the plugin identifies and parses these values for diagnostic purposes and to ensure clean logs, they are not surfaced as interactive controls or alerts in Matter controllers (such as the Apple Home app).

The Matter specification does not provide standardised clusters or attributes for reporting specific air purifier hardware faults or a sleep timer. For detailed maintenance alerts or troubleshooting of specific hardware errors, you should refer to the MyDyson app or the device's physical display.

The plugin includes support for these fields in its internal definitions to provide a foundation for future compatibility if the Matter protocol expands. This ensures that the plugin can remain stable and keep the device reachable even when the appliance is reporting these internal codes.

#### Why isn't my Dyson Solarcycle Morph desk light supported?

The Dyson Solarcycle Morph desk light (model `CD06`) is a Bluetooth-only device, indicated by the `connectionCategory: 'lecOnly'` field in the MyDyson API manifest. For an appliance to be bridged to Matter via this plugin, it must be reachable via Wi-Fi (`wifiOnly` or `lecAndWifi`).

While the MyDyson API includes MQTT-related fields such as `remoteBrokerType: 'wss'`, testing has confirmed that no traffic or control capability is actually exposed via Dyson's AWS IoT cloud gateway for these models. Without a local network interface or a functional cloud MQTT proxy, there is no technical pathway for the plugin to monitor or control the device.

#### 🚧 Why does my Dyson 360 Heurist or Vis Nav show errors or missing telemetry data? 🚧

<!-- INCLUDES: issue-13-4541 -->
Support for newer Dyson robot models, including the 360 Heurist and 360 Vis Nav, is a work in progress. These models employ significantly different cloud API capability schemas and MQTT message formats compared to the older 360 Eye. For example, they may omit standard fields such as `batteryChargeLevel` or `faults` in favour of new fields like `activeFaults` and `currentCleaningStrategy`.

To assist the maintainer in fully mapping these states to Matter attributes, you can provide diagnostic telemetry:
1. Enable `debug` in your plugin configuration.
2. Add `Log MQTT Payloads as JSON` to the `debugFeatures` array.
3. Record a log while the robot completes a full cleaning cycle, including interactions like pausing the device or removing the dustbin.
4. Submit this log via a GitHub issue for analysis.

#### 🚧 Why does the plugin fail to start with `Unexpected structure of Dyson cloud API response`? 🚧

<!-- INCLUDES: issue-17-fe91 -->
This error occurs when the plugin encounters a device capability, model identifier, or response structure from the Dyson Cloud API that is not yet defined in its internal schema. The plugin employs strict validation to ensure that all data provided by the API is correctly understood and handled. This design choice prevents unpredictable behaviour and allows for the precise identification of new features or API changes introduced by Dyson. 

If you encounter this error:
1. Ensure the plugin is updated to the latest version, as support for new capabilities (such as `ReadyOffDock` or new robot models) is added frequently.
2. Review the logs for the specific validation failure, for example: `response[x].connectedConfiguration.firmware.capabilities[y] is not a valid enum value`.
3. Report the log output, including the JSON response snippet provided in the error log, so the missing definitions can be added to the plugin.

#### 🚧 What is the level of support for the Dyson Spot+Scrub Ai (RB05)? 🚧

<!-- INCLUDES: issue-17-01c1 -->
The Dyson Spot+Scrub Ai (RB05) currently has a placeholder implementation in the plugin. While basic functionality like starting or stopping a clean may work, more advanced features unique to this model—such as mopping controls, dock maintenance, or specific cleaning strategies—are not yet supported. 

Full support requires capturing HTTPS traffic and MQTT logs from the MyDyson app to reverse-engineer the specific communication protocol used by this model. Because the maintainers do not have access to this specific hardware, implementation relies on community contributions of debug logs to map the device's unique capabilities.

#### 🚧 Why is my Dyson Solarcycle Morph desk light not supported by the plugin? 🚧

<!-- INCLUDES: issue-19-1b2e -->
The Dyson Solarcycle Morph desk light (model `CD06`) and similar lighting products are not supported because they use Bluetooth Low Energy (BLE) for communication rather than Wi-Fi. This is indicated in the device manifest by the `connectionCategory: 'lecOnly'` field.

While the Dyson cloud API may provide MQTT configuration details for these devices, investigations have shown that no control traffic or state updates are actually transmitted via the Dyson MQTT gateway for these models. Since the plugin requires either local Wi-Fi connectivity or a functional cloud MQTT bridge to interact with appliances, it cannot control BLE-only devices.

From version `1.9.1` onwards, the plugin is designed to identify these devices in your MyDyson account and gracefully ignore them. This ensures that the presence of an unsupported light does not prevent the plugin from starting or affect the operation of other supported Wi-Fi-enabled appliances, such as air purifiers or robot vacuums.

#### 🚧 Why are Dyson error codes such as `51C2` not visible in my Matter controller? 🚧

<!-- INCLUDES: issue-2-e183 -->
Dyson appliances report various internal status and error codes (for example `51C2`) over MQTT. The plugin identifies these codes to maintain device state and provide diagnostic information in the logs, but they are not currently exposed as actionable faults to Matter controllers like Apple Home or Google Home. This limitation is due to the Matter specification, which does not yet define a standard method for reporting detailed hardware diagnostics for the Air Purifier device category. For specific information regarding appliance faults or maintenance needs, refer to the official MyDyson app.

## Matterbridge

#### Why does `matterbridge-dyson-robot` report an older version in logs after an update?

<!-- INCLUDES: issue-16-09f2 -->
Matterbridge might report that a plugin is up to date, but the plugin's own log entry during startup may show an older version number. This discrepancy occurs if Matterbridge is restarted before a plugin update has fully completed its installation or if the system is referencing a cached version of the plugin.

To ensure you are running the latest version:

1. Allow sufficient time for the update to fully install before restarting Matterbridge.
2. Check the version number reported in the log with a `[Dyson Robot]` prefix during startup; this is the definitive version of the plugin instance currently running.
3. If the issue persists, uninstall and then reinstall the `matterbridge-dyson-robot` plugin to clear any cached files or lingering older files.

## Appliance Discovery and Filtering

#### 🚧 Why does the plugin still log details for appliances I have blacklisted? 🚧

<!-- INCLUDES: issue-13-160a -->
It is expected behaviour to see all appliances linked to your MyDyson account mentioned in the startup logs. The plugin must first query the Dyson cloud API to retrieve a full manifest of all devices to determine their models and communication requirements. The `entityBlackList` and `entityWhiteList` filters are applied after this initial discovery phase, just before the plugin registers devices as Matter endpoints. Consequently, even devices excluded from being bridged will appear during the initialisation and account-authorisation logs.

<!-- EXCLUDED: issue-1-59e4 issue-16-b5e2 issue-26-2ae8 -->
