# Frequently Asked Questions (FAQ)

<!-- TOC-START -->
- **[Unsupported Dyson Devices and Features](#unsupported-dyson-devices-and-features)**
  - [Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?](#why-does-the-plugin-fail-to-start-with-an-unexpected-structure-of-dyson-cloud-api-response-error)
  - [What information should I collect to enable support for a new Dyson models?](#what-information-should-i-collect-to-enable-support-for-a-new-dyson-models)
  - [Why are Dyson error codes and the sleep timer not visible in my Matter controller?](#why-are-dyson-error-codes-and-the-sleep-timer-not-visible-in-my-matter-controller)
  - [Why isn't my Dyson Solarcycle Morph desk light supported?](#why-isnt-my-dyson-solarcycle-morph-desk-light-supported)
- **[Matterbridge](#matterbridge)**
  - **[New subcategory](#new-subcategory)**
    - [Why does `matterbridge-dyson-robot` report an older version in logs after an update?](#why-does-matterbridge-dyson-robot-report-an-older-version-in-logs-after-an-update)
  - **[Plugin Configuration and Updates](#plugin-configuration-and-updates)**
<!-- TOC-END -->

## Unsupported Dyson Devices and Features

#### Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?

<!-- INCLUDES: issue-13-4830 issue-17-fc66 -->
The `Unexpected structure of Dyson cloud API response` error occurs because the plugin performs strict validation of all data received from the MyDyson cloud API. This is a deliberate design choice to ensure that any changes to the API or the introduction of new appliance capabilities are identified and correctly implemented rather than silently ignored. When Dyson releases a new model or a firmware update that includes data fields or values that the plugin does not yet recognise, the validation fails and prevents the plugin from starting.

To resolve this, ensure you are running the latest version of the plugin, as support for new device capabilities and structural variations is frequently added. If the error persists, please check the logs for the specific validation failure and provide a full debug log in a GitHub issue so the new API structures can be correctly mapped.

#### What information should I collect to enable support for a new Dyson models?

<!-- INCLUDES: issue-13-7af7 issue-16-b67c -->
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

<!-- INCLUDES: issue-2-64a4 -->
Dyson appliances report internal status, specific fault codes (such as `51C2`, `ercd`, `ste1`, or `iuh3`), and sleep timer data (`sltm`) via their MQTT stream. While the plugin identifies and parses these values for diagnostic purposes and to ensure clean logs, they are not surfaced as interactive controls or alerts in Matter controllers (such as the Apple Home app).

The Matter specification does not provide standardised clusters or attributes for reporting specific air purifier hardware faults or a sleep timer. For detailed maintenance alerts or troubleshooting of specific hardware errors, you should refer to the MyDyson app or the device's physical display.

The plugin includes support for these fields in its internal definitions to provide a foundation for future compatibility if the Matter protocol expands. This ensures that the plugin can remain stable and keep the device reachable even when the appliance is reporting these internal codes.

#### Why isn't my Dyson Solarcycle Morph desk light supported?

<!-- INCLUDES: issue-19-951c -->
The Dyson Solarcycle Morph desk light (model `CD06`) is a Bluetooth-only device, indicated by the `connectionCategory: 'lecOnly'` field in the MyDyson API manifest. For an appliance to be bridged to Matter via this plugin, it must be reachable via Wi-Fi (`wifiOnly` or `lecAndWifi`).

While the MyDyson API includes MQTT-related fields such as `remoteBrokerType: 'wss'`, testing has confirmed that no traffic or control capability is actually exposed via Dyson's AWS IoT cloud gateway for these models. Without a local network interface or a functional cloud MQTT proxy, there is no technical pathway for the plugin to monitor or control the device.

#### 🚧 Why are the sleep timer and device fault codes not available in my Matter controller? 🚧

<!-- INCLUDES: issue-1-4ad6 -->
While the plugin parses sleep timer data (`sltm`) and various hardware fault codes (such as `sen5` or `sen6`) from Dyson MQTT messages, these features are not currently exposed to Matter controllers. This is because the **Matter 1.4 specification** does not yet define standard clusters, attributes, or device types suitable for representing these specific functions. Support for these fields is maintained internally within the plugin to ensure clean logs and to facilitate future integration should the Matter specification expand to include them.

## Matterbridge

### New subcategory

#### Why does `matterbridge-dyson-robot` report an older version in logs after an update?

<!-- INCLUDES: issue-16-09f2 -->
Matterbridge might report that a plugin is up to date, but the plugin's own log entry during startup may show an older version number. This discrepancy occurs if Matterbridge is restarted before a plugin update has fully completed its installation or if the system is referencing a cached version of the plugin.

To ensure you are running the latest version:

1. Allow sufficient time for the update to fully install before restarting Matterbridge.
2. Check the version number reported in the log with a `[Dyson Robot]` prefix during startup; this is the definitive version of the plugin instance currently running.
3. If the issue persists, uninstall and then reinstall the `matterbridge-dyson-robot` plugin to clear any cached files or lingering older files.

### Plugin Configuration and Updates

#### 🚧 Why does the plugin report configuration errors after updating to version 0.2.0 or later? 🚧

<!-- INCLUDES: issue-1-59e4 -->
Version 0.2.0 introduced a significant change to the configuration schema to accommodate MyDyson account support and AWS IoT integration. If you are upgrading from a version prior to 0.2.0, your configuration file may contain legacy or extraneous fields. Because the Matterbridge configuration editor does not always automatically prune old settings, you may see warnings regarding extraneous configuration values. It is recommended to recreate the configuration or manually remove deprecated fields to align with the current schema.

<!-- EXCLUDED: issue-16-b5e2 issue-17-1ece issue-26-2ae8 -->
