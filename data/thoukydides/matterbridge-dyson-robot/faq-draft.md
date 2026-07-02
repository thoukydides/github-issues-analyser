# Frequently Asked Questions (FAQ)

<!-- TOC-START -->
- **[Unsupported Dyson Devices and Features](#unsupported-dyson-devices-and-features)**
  - [Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?](#why-does-the-plugin-fail-to-start-with-an-unexpected-structure-of-dyson-cloud-api-response-error)
  - [What information should I collect to enable support for a new Dyson model or missing features?](#what-information-should-i-collect-to-enable-support-for-a-new-dyson-model-or-missing-features)
  - [Why are Dyson error codes and the sleep timer not visible in my Matter controller?](#why-are-dyson-error-codes-and-the-sleep-timer-not-visible-in-my-matter-controller)
  - [Why isn't my Dyson Solarcycle Morph desk light supported?](#why-isnt-my-dyson-solarcycle-morph-desk-light-supported)
- **[Matterbridge](#matterbridge)**
  - [Why does `matterbridge-dyson-robot` report an older version in logs after an update?](#why-does-matterbridge-dyson-robot-report-an-older-version-in-logs-after-an-update)
- **[Appliance Discovery and Status](#appliance-discovery-and-status)**
  - [Why does the plugin still log details for appliances I have blacklisted?](#why-does-the-plugin-still-log-details-for-appliances-i-have-blacklisted)
  - [Why does Apple Home show `Updating` for my Dyson robot vacuum?](#why-does-apple-home-show-updating-for-my-dyson-robot-vacuum)
- **[Apple Home and HomeKit Mapping](#apple-home-and-homekit-mapping)**
  - [Why can only one part of the appliance be moved to a different room in Apple Home?](#why-can-only-one-part-of-the-appliance-be-moved-to-a-different-room-in-apple-home)
  - [Why does the `Composed Air Purifier` option cause issues in Apple Home?](#why-does-the-composed-air-purifier-option-cause-issues-in-apple-home)
<!-- TOC-END -->

## Unsupported Dyson Devices and Features

#### Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?

<!-- INCLUDES: issue-17-fe91 -->
The `Unexpected structure of Dyson cloud API response` error occurs because the plugin performs strict validation of all data received from the MyDyson cloud API. This is a deliberate design choice to ensure that any changes to the API, new model identifiers, or the introduction of new appliance capabilities are identified and correctly implemented rather than silently ignored. When Dyson releases a new model or a firmware update that includes data fields or values that the plugin does not yet recognise, the validation fails, which prevents the plugin from starting.

To resolve this, ensure you are running the latest version of the plugin. If the error persists, please check the logs for the specific validation failure and provide a full debug log in a GitHub issue so the new API structures can be correctly mapped.

#### What information should I collect to enable support for a new Dyson model or missing features?

<!-- INCLUDES: issue-13-4541 issue-16-b67c -->
The information required depends on the device type and the specific feature being requested:

1. **General MQTT Data (Purifiers and basic Robot state)**: Use the `opendyson` tool to capture a log whilst exercising the device's functionality. Install it via `go install github.com/libdyson-wg/opendyson`, then use `opendyson login`, `opendyson devices`, and `opendyson listen SERIALNUMBER` to collect data.

2. **Advanced Robot Features (Maps and Zone Cleaning)**: Dyson robots perform many operations via HTTPS rather than MQTT. Use a tool like Proxyman to capture traffic from the MyDyson app for the host `appapi.cp.dyson.com`. Perform tasks like zone cleaning and viewing maps, then share the `.proxymanlogv2` file.

3. **Plugin Debug Logs**: If a device is already recognised but missing telemetry, enable `debug` in your configuration and add `Log MQTT Payloads as JSON` to the `debugFeatures` array. Record a log while the device completes a cycle (e.g. a full clean) and submit the output via a GitHub issue.

#### Why are Dyson error codes and the sleep timer not visible in my Matter controller?

<!-- INCLUDES: issue-1-4ad6 issue-2-e183 -->
Dyson appliances report internal status, specific fault codes (such as `51C2`, `ercd`, or `iuh3`), and sleep timer data (`sltm`) via MQTT. While the plugin identifies and parses these values for diagnostics and logging, they are not surfaced as interactive controls or alerts in Matter controllers (such as the Apple Home app).

This is primarily due to limitations in the Matter specification, which does not currently provide standardised clusters or attributes for reporting detailed hardware diagnostics or sleep timers for the Air Purifier device category. For detailed maintenance alerts or troubleshooting specific hardware errors, you should refer to the MyDyson app or the device's physical display.

#### Why isn't my Dyson Solarcycle Morph desk light supported?

<!-- INCLUDES: issue-19-1b2e -->
The Dyson Solarcycle Morph desk light (model `CD06`) and similar lighting products are Bluetooth-only devices, indicated by the `connectionCategory: 'lecOnly'` field in the MyDyson API manifest. For an appliance to be bridged to Matter via this plugin, it must be reachable via Wi-Fi (`wifiOnly` or `lecAndWifi`).

While the MyDyson API includes MQTT configuration for these models, testing has confirmed that no control traffic or state updates are actually transmitted via Dyson's cloud gateway for BLE-only devices. Without a local network interface or a functional cloud MQTT proxy, there is no technical pathway for the plugin to control the device. The plugin identifies these devices and gracefully ignores them to ensure they do not interfere with the operation of supported Wi-Fi-enabled appliances.

## Matterbridge

#### Why does `matterbridge-dyson-robot` report an older version in logs after an update?

<!-- INCLUDES: issue-16-09f2 -->
Matterbridge might report that a plugin is up to date, but the plugin's own log entry during startup may show an older version number. This discrepancy occurs if Matterbridge is restarted before a plugin update has fully completed its installation or if the system is referencing a cached version of the plugin.

To ensure you are running the latest version:

1. Allow sufficient time for the update to fully install before restarting Matterbridge.
2. Check the version number reported in the log with a `[Dyson Robot]` prefix during startup; this is the definitive version of the plugin instance currently running.
3. If the issue persists, uninstall and then reinstall the `matterbridge-dyson-robot` plugin to clear any cached files or lingering older files.

## Appliance Discovery and Status

#### Why does the plugin still log details for appliances I have blacklisted?

<!-- INCLUDES: issue-13-160a -->
It is expected behaviour to see all appliances linked to your MyDyson account mentioned in the startup logs. The plugin must first query the Dyson cloud API to retrieve a full manifest of all devices to determine their models and communication requirements.

The `entityBlackList` and `entityWhiteList` filters are applied after this initial discovery phase, just before the plugin registers devices as Matter endpoints. Consequently, even devices excluded from being bridged will appear during the initialisation and account-authorisation logs.

#### Why does Apple Home show `Updating` for my Dyson robot vacuum?

<!-- INCLUDES: issue-32-d8b6 -->
The `Updating...` status in Apple Home typically occurs when the Matter subscription between the Apple Home hub and Matterbridge is cancelled or fails to sustain an idle connection. This is an underlying protocol and connection management behaviour handled entirely by `matter.js` and the Matter controller, rather than the Dyson plugin.

Robot vacuums (RVCs) are frequently idle for long periods and generate very few status updates compared to other appliances (such as air purifiers, which continuously stream environmental data). In certain network environments or controller firmware versions, this lack of activity can lead the Home hub to cancel the subscription, which is not subsequently recovered.

To address this behaviour:
1. Check your log files for `Subscription cancelled by peer` or `Subscription canceled by peer, re-announce` messages. This confirms the issue is at the Matter layer rather than the plugin communication with the Dyson vacuum.
2. Ensure that Matterbridge, Node.js, and your Apple Home hubs (Apple TV or HomePod) are updated to their latest software versions.
3. If the issue persists, seek support via the [Matterbridge Discord](https://discord.gg/QX58CDe6hd) server, or open an issue on the [Matterbridge](https://github.com/Luligu/matterbridge/issues/new/choose) or [matter.js](https://github.com/matter-js/matter.js/issues) GitHub repositories, as the resolution lies within the Matter implementation layer.

## Apple Home and HomeKit Mapping

#### Why can only one part of the appliance be moved to a different room in Apple Home?

<!-- INCLUDES: issue-33-3d80 -->
Dyson appliances are multi-functional, providing fan control alongside various sensors. The plugin represents these as a single multi-endpoint accessory to expose all features via Matter.

In Apple Home, this results in multiple entities grouped under one parent accessory. Room assignment for the entire appliance is controlled by the primary "master" entity. When you move the primary accessory to a different room, all associated sub-entities (such as temperature or humidity sensors) will automatically follow. Room settings cannot be changed on the individual sub-entities independently.

#### Why does the `Composed Air Purifier` option cause issues in Apple Home?

The Apple Home app does not correctly handle the Matter specification's `Composed Air Purifier` accessory category. This leads to an unpredictable, buggy, or broken user interface when this option is enabled.

If Apple Home is your primary Matter controller, it is recommended to avoid the `Composed Air Purifier` configuration. By default, the plugin exposes the appliance as individual accessory endpoints (such as separate fan, air quality, temperature, and humidity sensors), which ensures all controls and sensor readings are displayed reliably in the Home app.

#### 🚧 Why does the `Composed Air Purifier` configuration show an unpredictable or incomplete UI in Apple Home? 🚧

<!-- INCLUDES: issue-35-8df4 -->
The Apple Home app does not correctly handle the Matter `Composed Air Purifier` specification, which results in an unpredictable, incomplete, and degraded user interface. If you are using Apple Home (HomeKit) as your primary Matter ecosystem, it is highly recommended to avoid enabling the `Composed Air Purifier` option. Instead, configure the device using individual accessory endpoints to ensure all controls and sensors are fully functional and rendered correctly within the app.

<!-- EXCLUDED: issue-1-59e4 issue-13-4541 issue-16-b5e2 issue-17-01c1 issue-26-2ae8 issue-31-833f -->
