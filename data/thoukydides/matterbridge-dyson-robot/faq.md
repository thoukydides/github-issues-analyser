# Frequently Asked Questions (FAQ)

<!-- TOC-START -->
- **[Unsupported Dyson Devices and Features](#unsupported-dyson-devices-and-features)**
  - [Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?](#why-does-the-plugin-fail-to-start-with-an-unexpected-structure-of-dyson-cloud-api-response-error)
  - [What information should I collect to enable support for a new Dyson model or missing features?](#what-information-should-i-collect-to-enable-support-for-a-new-dyson-model-or-missing-features)
  - [Where is the `libdyson` configuration file located?](#where-is-the-libdyson-configuration-file-located)
  - [Why are Dyson error codes and the sleep timer not visible in my Matter controller?](#why-are-dyson-error-codes-and-the-sleep-timer-not-visible-in-my-matter-controller)
  - [Why isn't my Dyson Solarcycle Morph desk light supported?](#why-isnt-my-dyson-solarcycle-morph-desk-light-supported)
  - **[Dyson Spot+Scrub Ai and R1/R2/R3 Nurovi Support](#dyson-spotscrub-ai-and-r1r2r3-nurovi-support)**
    - [Why does the Dyson Spot+Scrub Ai or R1/R2/R3 Nurovi status take time to update?](#why-does-the-dyson-spotscrub-ai-or-r1r2r3-nurovi-status-take-time-to-update)
    - [Why does `opendyson listen` fail to show status messages for robot vacuums?](#why-does-opendyson-listen-fail-to-show-status-messages-for-robot-vacuums)
- **[Matterbridge](#matterbridge)**
  - [Why does `matterbridge-dyson-robot` report an older version in logs after an update?](#why-does-matterbridge-dyson-robot-report-an-older-version-in-logs-after-an-update)
- **[Appliance Discovery and Filtering](#appliance-discovery-and-filtering)**
  - [Why does the plugin still log details for appliances I have blacklisted?](#why-does-the-plugin-still-log-details-for-appliances-i-have-blacklisted)
  - [Why does Apple Home show `Updating` for my Dyson robot vacuum?](#why-does-apple-home-show-updating-for-my-dyson-robot-vacuum)
- **[Apple Home and HomeKit Mapping](#apple-home-and-homekit-mapping)**
  - [Why does the `Composed Air Purifier` option cause issues in Apple Home?](#why-does-the-composed-air-purifier-option-cause-issues-in-apple-home)
  - [How can I trigger room-specific cleaning using Siri?](#how-can-i-trigger-room-specific-cleaning-using-siri)
  - [Why does selecting rooms in Apple Home immediately start cleaning?](#why-does-selecting-rooms-in-apple-home-immediately-start-cleaning)
<!-- TOC-END -->

## Unsupported Dyson Devices and Features

#### Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?

<!-- INCLUDES: issue-17-fe91 -->
The `Unexpected structure of Dyson cloud API response` error occurs because the plugin performs strict schema validation on all data received from the MyDyson cloud API (such as the `/v3/manifest`) and MQTT payloads. This is a deliberate design choice to ensure that any changes to the API are identified and correctly implemented rather than silently ignored.

This error frequently occurs with newer models or firmware updates are released. Support for these models is often developed without direct access to physical devices.

To resolve this:
1. Ensure you are running the latest version of the plugin, as new capabilities are added incrementally.
2. Enable detailed diagnostic logging in your configuration:
```json
{
    "wildcardTopic": true,
    "debug": true,
    "debugFeatures": [
        "Log API Bodies",
        "Log MQTT Payloads as JSON",
        "Log Debug as Info"
    ]
}
```
3. Record an entire operational cycle: for a robot vacuum confirm the plugin establishes an MQTT connection, start a full clean, allow the robot to return to its dock autonomously, and allow all dock maintenance routines (such as self-cleaning or drying) to finish completely.
4. Provide the redacted logs in a GitHub issue so the missing capabilities and MQTT structures can be correctly mapped.

#### What information should I collect to enable support for a new Dyson model or missing features?

<!-- INCLUDES: issue-13-4541 issue-16-b67c issue-50-b8fb -->
The information required depends on the device type and the specific feature being requested:

1. **General MQTT Data (Purifiers and basic Robot state)**: Use the `opendyson` tool to capture a log whilst exercising the device's functionality. Install it via `go install github.com/libdyson-wg/opendyson`, then use `opendyson login`, `opendyson devices`, and `opendyson listen SERIALNUMBER` to collect data. Dyson robots use a MQTT status topic that is unsupported by `opendyson`; plugin debug logs are also required to capture this.

2. **Advanced Robot Features (Maps and Zone Cleaning)**: Dyson robots perform many operations via HTTPS rather than MQTT. Use a tool like Proxyman to capture traffic from the MyDyson app for the host `appapi.cp.dyson.com`. Perform tasks like zone cleaning and viewing maps, then share the `.proxymanlogv2` file.

3. **Plugin Debug Logs**: If a device is already recognised but missing telemetry, enable `debug` and `wildcardTopic` in your configuration, and add `Log MQTT Payloads as JSON` to the `debugFeatures` array. Record an entire operational cycle from start to finish, including autonomous return to dock and any maintenance routines (e.g. mop washing or drying). Providing an accompanying timeline of observed robot activity alongside the output helps map behaviour accurately. Inspect logs prior to sharing to ensure all private identifiers remain protected.

#### Where is the `libdyson` configuration file located?

When performing manual token retrieval or troubleshooting authentication using tools like `opendyson`, you may need to access the `libdyson` configuration file. This file, named `config.yml`, contains the credentials required for the plugin to communicate with Dyson's cloud services.

The location of this file is determined by the capture tools following standard platform-specific conventions for application data:
- **Linux**: `~/.config/libdyson/config.yml` 
- **macOS**: `~/Library/Application Support/libdyson/config.yml` 

Note that these paths are relative to the user's home directory.

#### Why are Dyson error codes and the sleep timer not visible in my Matter controller?

<!-- INCLUDES: issue-1-4ad6 issue-2-e183 -->
Dyson appliances report internal status, specific fault codes (such as `51C2`, `ercd`, or `iuh3`), and sleep timer data (`sltm`) via MQTT. While the plugin identifies and parses these values for diagnostics and logging, they are not surfaced as interactive controls or alerts in Matter controllers (such as the Apple Home app).

This is primarily due to limitations in the Matter specification, which does not currently provide standardised clusters or attributes for reporting detailed hardware diagnostics or sleep timers for the Air Purifier device category. For detailed maintenance alerts or troubleshooting specific hardware errors, you should refer to the MyDyson app or the device's physical display.

#### Why isn't my Dyson Solarcycle Morph desk light supported?

<!-- INCLUDES: issue-19-1b2e -->
The Dyson Solarcycle Morph desk light (model `CD06`) and similar lighting products are Bluetooth-only devices, indicated by the `connectionCategory: 'lecOnly'` field in the MyDyson API manifest. For an appliance to be bridged to Matter via this plugin, it must be reachable via Wi-Fi (`wifiOnly` or `lecAndWifi`).

While the MyDyson API includes MQTT configuration for these models, testing has confirmed that no control traffic or state updates are actually transmitted via Dyson's cloud gateway for BLE-only devices. Without a local network interface or a functional cloud MQTT proxy, there is no technical pathway for the plugin to control the device. The plugin identifies these devices and gracefully ignores them to ensure they do not interfere with the operation of supported Wi-Fi-enabled appliances.

### Dyson Spot+Scrub Ai and R1/R2/R3 Nurovi Support

#### Why does the Dyson Spot+Scrub Ai or R1/R2/R3 Nurovi status take time to update?

<!-- INCLUDES: issue-46-9bdb -->
Unlike most other Dyson appliances, the RB05 and RB07 robot vacuums do not automatically publish changes to their status as MQTT messages. While they publish regular position data during active cleaning, a full status update (including battery levels and cleaning progress) is only provided when the robot is specifically polled using an MQTT `REQUEST-CURRENT-STATE` command. The plugin publishes this command every 30 seconds (which is believed to match the behaviour of the official MyDyson app) to poll for the current status, so changes may take that much longer to propagate to Matter.

#### Why does `opendyson listen` fail to show status messages for robot vacuums?

The `opendyson` tool by default subscribes to MQTT topics used by air treatment devices such as `<model>/<serial>/status/current` and `<model>/<serial>/status/fault`. However, robot vacuums instead publish their status to the more general `<model>/<serial>/status` topic, with RB05 and later models additionally using `<model>/<serial>/status/jdm`. This mismatch in expected MQTT topics means `opendyson` will not receive any status messages, making it appear as if the device is not publishing.

## Matterbridge

#### Why does `matterbridge-dyson-robot` report an older version in logs after an update?

<!-- INCLUDES: issue-16-09f2 -->
Matterbridge might report that a plugin is up to date, but the plugin's own log entry during startup may show an older version number. This discrepancy occurs if Matterbridge is restarted before a plugin update has fully completed its installation or if the system is referencing a cached version of the plugin.

To ensure you are running the latest version:

1. Allow sufficient time for the update to fully install before restarting Matterbridge.
2. Check the version number reported in the log with a `[Dyson Robot]` prefix during startup; this is the definitive version of the plugin instance currently running.
3. If the issue persists, uninstall and then reinstall the `matterbridge-dyson-robot` plugin to clear any cached files or lingering older files.

## Appliance Discovery and Filtering

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

#### Why does the `Composed Air Purifier` option cause issues in Apple Home?

<!-- INCLUDES: issue-35-8df4 -->
The Apple Home app only supports simple Matter devices correctly. When multiple devices are composed into a single bridged device, or subset device types are included, the Home app exhibits multiple issues:
* The device icon can be for any of the composed or subset device types, instead of selecting the most relevant (the first recognised device type on the parent endpoint), e.g. an **Air Purifier** device may be randomly shown as a **Fan Device** or **Air Quality Sensor** instead.
* Controls may be duplicated in the user interface if they can correspond to multiple overlapping device types, e.g. two fan speed sliders are shown if a device describes itself as both an **Air Purifier** and a **Fan** device.
* Functionality is often reduced, e.g. an **Air Purifier** incorporating an **Air Quality** device results in the *Auto* mode, fan oscillation controls, and all sensor measurements, being hidden.

If Apple Home is your primary Matter ecosystem, it is recommended to avoid the `Composed Air Purifier` configuration. By default, the plugin exposes the appliance as individual accessory endpoints (such as separate fan, air quality, temperature, and humidity sensors), which ensures all controls and sensor readings are displayed reliably in the Home app.

#### How can I trigger room-specific cleaning using Siri?

<!-- INCLUDES: issue-46-1b6c -->
While the plugin exposes rooms as Service Areas in Matter, these can be difficult to invoke via Siri. The most effective way to control specific rooms in Apple Home is through **Scenes**.

1. Create a new Scene in the Apple Home app.
2. Add the Dyson robot to the Scene.
3. Configure the robot's state within the Scene to be **Cleaning** and select the specific rooms you want it to target.
4. You can then trigger this Scene via Siri (e.g. 'Siri, clean the kitchen') or through automations.

The plugin will use the per-room settings (vacuum power, water flow, etc.) already configured for those rooms in the MyDyson app when the Scene is activated.

#### Why does selecting rooms in Apple Home immediately start cleaning?

<!-- INCLUDES: issue-51-064a -->
Selecting rooms or zones and confirming the selection in Apple Home starts cleaning immediately by design, rather than waiting for an explicit start or play command.

This behaviour is intentional for several reasons:

- **Matter specification compliance**: Section 1.17.7.1 (`SelectAreas` Command) of the Matter Application Cluster Specification specifies that a device may begin operating immediately or wait for a command, defining this behaviour as manufacturer-specific.
- **Protection of per-room settings**: Dyson robots store individual cleaning preferences per room or zone configured within the MyDyson app (such as preventing mopping on carpeted areas). When initiating a room clean, the plugin defaults to these saved per-zone configurations rather than allowing a single global Matter clean mode to override them, which could risk damage to flooring.

Because any global mode selected in Apple Home during room selection is deliberately ignored in favour of pre-configured zone settings, the clean begins as soon as the area selection is confirmed.

<!-- EXCLUDED: issue-1-59e4 issue-13-4541 issue-16-b5e2 issue-17-01c1 issue-26-2ae8 issue-31-833f issue-33-3d80 issue-46-1f2c issue-46-2ab8 issue-46-91b2 issue-51-3cb0 -->
