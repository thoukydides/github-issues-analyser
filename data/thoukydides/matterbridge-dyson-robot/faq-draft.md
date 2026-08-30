# Frequently Asked Questions (FAQ)

<!-- TOC-START -->
- **[Unsupported Dyson Devices and Features](#unsupported-dyson-devices-and-features)**
  - **[New subcategory](#new-subcategory)**
    - [Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?](#why-does-the-plugin-fail-to-start-with-an-unexpected-structure-of-dyson-cloud-api-response-error)
    - [What information should I collect to enable support for a new Dyson model or missing features?](#what-information-should-i-collect-to-enable-support-for-a-new-dyson-model-or-missing-features)
    - [Where is the `libdyson` configuration file located?](#where-is-the-libdyson-configuration-file-located)
    - [Why are Dyson error codes and the sleep timer not visible in my Matter controller?](#why-are-dyson-error-codes-and-the-sleep-timer-not-visible-in-my-matter-controller)
    - [Why isn't my Dyson Solarcycle Morph desk light supported?](#why-isnt-my-dyson-solarcycle-morph-desk-light-supported)
  - **[Dyson Spot+Scrub Ai (RB05) Limitations and Behaviours](#dyson-spotscrub-ai-rb05-limitations-and-behaviours)**
    - [Why is my Dyson Spot+Scrub Ai (RB05) robot not detected on my local network?](#why-is-my-dyson-spotscrub-ai-rb05-robot-not-detected-on-my-local-network)
    - [Why does the status of my Dyson RB05 robot lag or fail to update in the smart home app?](#why-does-the-status-of-my-dyson-rb05-robot-lag-or-fail-to-update-in-the-smart-home-app)
    - [Why does my Dyson RB05 report faults when it is performing a normal cleaning run?](#why-does-my-dyson-rb05-report-faults-when-it-is-performing-a-normal-cleaning-run)
    - [Why are zone cleaning and cleaning maps not available for the Dyson RB05?](#why-are-zone-cleaning-and-cleaning-maps-not-available-for-the-dyson-rb05)
- **[Matterbridge](#matterbridge)**
  - [Why does `matterbridge-dyson-robot` report an older version in logs after an update?](#why-does-matterbridge-dyson-robot-report-an-older-version-in-logs-after-an-update)
- **[Appliance Discovery and Filtering](#appliance-discovery-and-filtering)**
  - [Why does the plugin still log details for appliances I have blacklisted?](#why-does-the-plugin-still-log-details-for-appliances-i-have-blacklisted)
  - [Why does Apple Home show `Updating` for my Dyson robot vacuum?](#why-does-apple-home-show-updating-for-my-dyson-robot-vacuum)
- **[Apple Home and HomeKit Mapping](#apple-home-and-homekit-mapping)**
  - [Why does the `Composed Air Purifier` option cause issues in Apple Home?](#why-does-the-composed-air-purifier-option-cause-issues-in-apple-home)
<!-- TOC-END -->

## Unsupported Dyson Devices and Features

### New subcategory

#### Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?

<!-- INCLUDES: issue-17-fe91 -->
The `Unexpected structure of Dyson cloud API response` error occurs because the plugin performs strict validation of all data received from the MyDyson cloud API. This is a deliberate design choice to ensure that any changes to the API, new model identifiers, or the introduction of new appliance capabilities are identified and correctly implemented rather than silently ignored. When Dyson releases a new model or a firmware update that includes data fields or values that the plugin does not yet recognise, the validation fails, which prevents the plugin from starting.

To resolve this, ensure you are running the latest version of the plugin. If the error persists, please check the logs for the specific validation failure and provide a full debug log in a GitHub issue so the new API structures can be correctly mapped.

#### What information should I collect to enable support for a new Dyson model or missing features?

<!-- INCLUDES: issue-13-4541 issue-16-b67c -->
The information required depends on the device type and the specific feature being requested:

1. **General MQTT Data (Purifiers and basic Robot state)**: Use the `opendyson` tool to capture a log whilst exercising the device's functionality. Install it via `go install github.com/libdyson-wg/opendyson`, then use `opendyson login`, `opendyson devices`, and `opendyson listen SERIALNUMBER` to collect data. *Dyson robots use a MQTT status topic that is unsupported by `opendyson`; a plugin debug log is also required to capture this.*

2. **Advanced Robot Features (Maps and Zone Cleaning)**: Dyson robots perform many operations via HTTPS rather than MQTT. Use a tool like Proxyman to capture traffic from the MyDyson app for the host `appapi.cp.dyson.com`. Perform tasks like zone cleaning and viewing maps, then share the `.proxymanlogv2` file.

3. **Plugin Debug Logs**: If a device is already recognised but missing telemetry, enable `debug` in your configuration and add `Log MQTT Payloads as JSON` to the `debugFeatures` array. Record a log while the device completes a cycle (e.g. a full clean) and submit the output via a GitHub issue.

#### Where is the `libdyson` configuration file located?

When performing manual token retrieval or troubleshooting authentication, you may need to access the `libdyson` configuration file. This file, named `config.yml`, contains the credentials required for the plugin to communicate with Dyson's cloud services.

The location of this file depends on the operating system:

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

### Dyson Spot+Scrub Ai (RB05) Limitations and Behaviours

#### Why is my Dyson Spot+Scrub Ai (RB05) robot not detected on my local network?

<!-- INCLUDES: issue-46-9a90 -->
The Dyson Spot+Scrub Ai (RB05) hardware does not host a local listener or open any ports on the local network. Unlike earlier models such as the 360 Eye, Heurist, or Vis Nav, it communicates exclusively via outbound connections to the MyDyson cloud (AWS IoT).

Consequently, local provisioning and local-only control methods are not possible for this device; the plugin must interact with it through the cloud infrastructure using cloud credentials. Control is not possible if the internet connection is interrupted.

#### Why does the status of my Dyson RB05 robot lag or fail to update in the smart home app?

<!-- INCLUDES: issue-46-66fd -->
The RB05 firmware does not automatically push comprehensive state updates via MQTT when its state changes. While the robot pushes incremental position data (`globalPosition`) frequently while moving, it only provides full status information when explicitly requested.

To maintain an accurate status in the Matter fabric, the plugin implements a configurable polling interval specifically for this model to periodically fetch the current state from the device. This balances responsiveness with API traffic; consequently, changes may take a few moments to reflect in HomeKit or other Matter controllers.

#### Why does my Dyson RB05 report faults when it is performing a normal cleaning run?

<!-- INCLUDES: issue-46-7f58 -->
The RB05 uses the `activeFaults` MQTT field to report operational status messages in addition to actual hardware errors. For example, status codes in the 21xx series, such as `2109` (`FULL_CLEAN_RUNNING`) or `2101` (`WASHING_MOP` or charging), are sent through this channel.

The plugin is configured to identify and filter these `LOG_ONLY` messages to ensure that only genuine hardware faults requiring user intervention are surfaced.

#### Why are zone cleaning and cleaning maps not available for the Dyson RB05?

The Dyson Spot+Scrub Ai (RB05) uses a different non-MQTT cloud API for zone management and map rendering compared to previous models. Because these features are handled outside of the standard MQTT protocol used for basic controls, they require specific reverse engineering of the MyDyson API for this model.

Until this API mapping is completed, zone selection and map visualisation are not supported.

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

<!-- EXCLUDED: issue-1-59e4 issue-13-4541 issue-16-b5e2 issue-17-01c1 issue-26-2ae8 issue-31-833f issue-33-3d80 -->
