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
    - [Why does selecting a mopping mode or clean mode fail or have no effect?](#why-does-selecting-a-mopping-mode-or-clean-mode-fail-or-have-no-effect)
    - [Why is the `Vacuum then mop` clean mode not supported for Dyson robot mops?](#why-is-the-vacuum-then-mop-clean-mode-not-supported-for-dyson-robot-mops)
- **[Matterbridge](#matterbridge)**
  - [Why does `matterbridge-dyson-robot` report an older version in logs after an update?](#why-does-matterbridge-dyson-robot-report-an-older-version-in-logs-after-an-update)
- **[Appliance Discovery and Filtering](#appliance-discovery-and-filtering)**
  - [Why does the plugin still log details for appliances I have blacklisted?](#why-does-the-plugin-still-log-details-for-appliances-i-have-blacklisted)
  - [Why does Apple Home show `Updating` for my Dyson robot vacuum?](#why-does-apple-home-show-updating-for-my-dyson-robot-vacuum)
- **[Apple Home and HomeKit Mapping](#apple-home-and-homekit-mapping)**
  - [Why does the `Composed Air Purifier` option cause issues in Apple Home?](#why-does-the-composed-air-purifier-option-cause-issues-in-apple-home)
  - [Why are there no individual switches for rooms or granular cleaning settings?](#why-are-there-no-individual-switches-for-rooms-or-granular-cleaning-settings)
  - [Why does selecting rooms in Apple Home immediately start cleaning?](#why-does-selecting-rooms-in-apple-home-immediately-start-cleaning)
  - [How are robot vacuum cleaning modes and suction levels displayed in Apple Home?](#how-are-robot-vacuum-cleaning-modes-and-suction-levels-displayed-in-apple-home)
- **[Diagnostic Logging](#diagnostic-logging)**
  - [How can I capture comprehensive diagnostic logs for troubleshooting?](#how-can-i-capture-comprehensive-diagnostic-logs-for-troubleshooting)
  - [What do extraneous fields or unrecognised MQTT message warnings in the logs mean?](#what-do-extraneous-fields-or-unrecognised-mqtt-message-warnings-in-the-logs-mean)
<!-- TOC-END -->

## Unsupported Dyson Devices and Features

<!-- PARTITION: Unsupported Dyson Devices and Features -->

#### Why does the plugin fail to start with an `Unexpected structure of Dyson cloud API response` error?

<!-- INCLUDES: issue-17-fe91 issue-50-11d5 issue-52-8b41 -->
The `Unexpected structure of Dyson cloud API response` error occurs because the plugin performs strict schema validation on all data received from the MyDyson cloud API (such as the `/v3/manifest`) and MQTT payloads. This is a deliberate design choice to ensure that any changes to the API or new hardware capabilities are identified and correctly implemented rather than silently ignored.

This error frequently occurs when newer models, regional variants, or firmware updates are released. Common causes for validation failure include:
- **Non-standard identifiers**: Dyson occasionally uses proprietary codes for regions or models. For example, codes like `AZ` (Australia/New Zealand), `XC`, or `XD` may be used instead of standard ISO country codes.
- **API Schema Changes**: Updates to Dyson's infrastructure may introduce new fields or modify data types.
- **Unsupported Capabilities**: Newer devices may report capabilities that the plugin has not yet been configured to handle.

Because the plugin validates the structure of the entire device manifest during startup, an unrecognised value for even a single device will prevent the plugin from loading and exposing any appliances to Matter. To resolve this:
1. Ensure you are running the latest version of the plugin.
2. Enable detailed diagnostic logging in your configuration, ensuring `wildcardTopic` and `debug` are set to `true`, and adding `Log API Bodies`, `Log MQTT Payloads as JSON`, and `Log Debug as Info` to the `debugFeatures` array.
3. Record an entire operational cycle: for a robot vacuum confirm the plugin establishes an MQTT connection, start a full clean, allow the robot to return to its dock autonomously, and allow all dock maintenance routines (such as self-cleaning or drying) to finish completely.
4. Provide the logs in a GitHub issue so the missing structures can be mapped.

#### What information should I collect to enable support for a new Dyson model or missing features?

<!-- INCLUDES: issue-13-4541 issue-16-b67c -->
The information required depends on the device type and the specific feature being requested:

1. **General MQTT Data (Purifiers and basic Robot state)**: Use the `opendyson` tool to capture a log whilst exercising the device's functionality. Install it via `go install github.com/libdyson-wg/opendyson`, then use `opendyson login`, `opendyson devices`, and `opendyson listen SERIALNUMBER` to collect data. Dyson robots use an MQTT status topic that is unsupported by `opendyson`; plugin debug logs are also required to capture this.

2. **Advanced Robot Features (Maps and Zone Cleaning)**: Dyson robots perform many operations via HTTPS rather than MQTT. Use a tool like Proxyman to capture traffic from the MyDyson app for the host `appapi.cp.dyson.com`. Perform tasks like zone cleaning and viewing maps, then share the `.proxymanlogv2` file.

3. **Plugin Debug Logs**: If a device is already recognised but missing telemetry, enable `debug` and `wildcardTopic` in your configuration, and add `Log API Bodies`, `Log MQTT Payloads as JSON`, and `Log Debug as Info` to the `debugFeatures` array. Record an entire operational cycle from start to finish, including autonomous return to dock and any maintenance routines (e.g. mop washing or drying). Providing an accompanying timeline of observed robot activity alongside the output helps map behaviour accurately. Inspect logs prior to sharing to ensure all private identifiers remain protected.

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

Unlike most other Dyson appliances, the RB05 and RB07 robot vacuums do not automatically publish changes to their status as MQTT messages. While they publish regular position data during active cleaning, a full status update (including battery levels and cleaning progress) is only provided when the robot is specifically polled using an MQTT `REQUEST-CURRENT-STATE` command. The plugin publishes this command every 30 seconds (which is believed to match the behaviour of the official MyDyson app) to poll for the current status, so changes may take that much longer to propagate to Matter.

#### Why does `opendyson listen` fail to show status messages for robot vacuums?

The `opendyson` tool by default subscribes to MQTT topics used by air treatment devices such as `<model>/<serial>/status/current` and `<model>/<serial>/status/fault`. However, robot vacuums instead publish their status to the more general `<model>/<serial>/status` topic, with RB05 and later models additionally using `<model>/<serial>/status/jdm`. This mismatch in expected MQTT topics means `opendyson` will not receive any status messages, making it appear as if the device is not publishing.

#### Why does selecting a mopping mode or clean mode fail or have no effect?

<!-- INCLUDES: issue-51-8334 -->
There are two distinct behaviours regarding mopping and clean modes depending on the type of cleaning being performed:

1. **Whole-home (Global) Clean**: Selecting `Mop` or `Vacuum and Mop` for a global clean on newer models like the RB05 currently results in a `Global clean mopping is not implemented` error. The specific MQTT command payloads required to initiate global cleaning with mopping have not yet been reverse-engineered. To support this, please provide MQTT logs from the MyDyson app initiating these actions in a feature request.

2. **Zone (Room) Clean**: For room-specific cleans, the plugin deliberately preserves the per-zone cleaning options defined in the MyDyson app map rather than applying the global Matter `CleanMode` setting. This design decision is driven by three factors:

- **Matter specification limitations**: Matter does not provide a mechanism for configuring per-zone options. Dyson appliances store numerous granular parameters—such as suction level, water flow rate, vacuum or mop passes, and UV sanitisation—that have no equivalent in the Matter Robotic Vacuum Cleaner (RVC) cluster.
- **Surface protection**: Overriding saved map settings with a global Matter clean mode risks running inappropriate routines on sensitive surfaces, such as wet mopping across carpeted areas where vacuum-only cleaning was configured.
- **Complexity of modes**: Attempting to expose every permutation of suction, hydration, and repetition settings as proprietary Matter clean modes would create dozens of non-standard options that are difficult to navigate in controller platforms such as Apple Home.

#### Why is the `Vacuum then mop` clean mode not supported for Dyson robot mops?

Although the MyDyson app offers both simultaneous 'Vacuum and Wash' and sequential 'Vacuum then Wash' modes for mop-equipped models (such as the Dyson R2 Nurovi), the plugin does not expose a distinct `Vacuum then mop` mode to Matter:

- **Identical device telemetry**: Dyson robot MQTT status messages (`CURRENT-STATE`) do not distinguish between simultaneous and sequential operations. Both cleaning styles report the identical state value of `VACUUMING_AND_MOPPING`.
- **Telemetry-only mode representation**: For models that configure cleaning options strictly per room within map preferences, the plugin uses the Matter Clean Mode attribute to reflect the robot's current activity rather than to command cleaning configurations. Because the appliance firmware does not report a distinct status for sequential passes, the plugin cannot accurately report or track this state.

#### 🚧 Why are cleaning repetitions and water levels not adjustable via Matter or Apple Home? 🚧

<!-- INCLUDES: issue-53-4473 -->
The Matter protocol does not currently include standard attributes for per-zone cleaning preferences such as water volume, UV light activation, or the number of cleaning passes. Although these options exist in the MyDyson app, they cannot be mapped to standard Matter controls without using proprietary extensions.

The plugin is designed to prioritise the per-zone configurations already established in the MyDyson app. When a clean is initiated via Matter, the plugin uses the existing map settings to determine how each room should be treated. This approach ensures that mopping is not accidentally enabled on carpeted areas and that specific suction or hydration levels are maintained according to the user's established preferences. Implementing these as extra `RVC Clean Mode` values would result in a combinatorial explosion of options that most Matter controllers cannot display effectively.

#### 🚧 Why does the robot report `Global clean mopping is not implemented` when a mopping mode is selected? 🚧

<!-- INCLUDES: issue-53-e6e0 -->
Starting a global clean (cleaning the entire house) with mopping enabled requires specific MQTT command sequencing that varies between Dyson models. On mopping-capable robots like the R2 Nurovi, the official app typically handles "all-room" cleans by sending a list of individual room preferences and map identifiers rather than a single global command.

Until the precise MQTT requirements for global mopping cleans are fully established and verified, the plugin treats mopping-related `RVC Clean Mode` settings primarily as status indicators. If a mopping mode is selected when starting a global clean, the plugin returns this error to prevent the robot from operating with incorrect or unsafe settings. To use mopping functionality, users should initiate cleans via the MyDyson app or as zone-based cleans that use the settings pre-configured in the Dyson map.

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

#### Why are there no individual switches for rooms or granular cleaning settings?

<!-- INCLUDES: issue-46-9197 issue-50-788a -->
The plugin does not provide dedicated virtual switch accessories for individual rooms, nor does it expose granular settings such as mop hydration levels, water flow, or cleaning repetitions. This is due to architectural constraints in the Matter specification and controller implementations:

* **Service Area Cluster**: Matter natively supports area selection through the Robotic Vacuum Cleaner (RVC) `Service Area` cluster. Creating artificial switches would conflict with this data model and add unnecessary complexity.
* **Matter specification limitations**: The current Matter RVC specification does not provide standard attributes for appliance-specific mechanics like water pump rates, mop hydration levels, or repetition counts. It also lacks a mechanism to pass zone-specific operational settings (such as differing suction or hydration levels per room) within a single cleaning command.
* **Combinatorial explosion of Clean Modes**: Grouping every combination of suction mode, water level, and repeat pass into discrete Matter Clean Modes would create an excessively large list. Furthermore, Apple Home does not display custom mode labels, making such a list effectively unusable.

To automate or voice-control specific rooms in Apple Home, use **Scenes**:

1. Create a new Scene in the Apple Home app.
2. Add the Dyson robot to the Scene.
3. Configure the robot's state to be **Cleaning** and select the specific rooms under **Service Areas**.
4. Trigger this Scene via Siri (e.g. 'Siri, clean the kitchen') or through automations.

The robot will apply the per-room cleaning rules (suction intensity, water flow, etc.) already configured within the MyDyson app for those areas.

#### Why does selecting rooms in Apple Home immediately start cleaning?

<!-- INCLUDES: issue-51-7189 -->
Selecting rooms or zones and confirming the selection in Apple Home starts cleaning immediately by design, rather than waiting for an explicit start or play command.

This behaviour is intentional for several reasons:

- **Matter specification compliance**: Section 1.17.7.1 (`SelectAreas` Command) of the Matter Application Cluster Specification specifies that a device may begin operating immediately or wait for a command, defining this behaviour as manufacturer-specific.
- **Protection of per-room settings**: Dyson robots store individual cleaning preferences per room or zone configured within the MyDyson app (such as preventing mopping on carpeted areas). When initiating a room clean, the plugin prioritises these saved per-zone configurations rather than allowing a single global Matter clean mode to override them, which could risk damage to flooring.

Because any global mode selected in Apple Home during room selection is deliberately ignored in favour of pre-configured zone settings, the clean begins as soon as the area selection is confirmed.

#### How are robot vacuum cleaning modes and suction levels displayed in Apple Home?

<!-- INCLUDES: issue-51-ceb8 -->
The Apple Home app determines where to display robot vacuum cleaning modes based on the Matter `ModeTags` assigned to them, rather than the custom labels provided by the plugin or the Dyson API. This results in two distinct UI areas:

* **Suction Power Group**: Modes containing tags such as `Quiet`, `Quick`, `Normal`, `Max`, or `Auto` are typically grouped into a selection pill or slider. Vacuum-only operation is available through these power levels; there is no separate 'Vacuum Only' switch because these modes are defined as vacuuming by default.
* **Operation Group**: Modes with functional tags like `Mop`, `DeepClean`, or `Vacuum and Mop` often appear in a list under the Play or Start button.

In some cases, such as with the Dyson Wash+Dry / R2 Nurovi (RB07), a hybrid mode like **Vacuum then mop** may be assigned tags that Apple Home associates with suction levels, causing it to appear in the pill section instead of the Play button menu. Additionally, Apple Home currently displays the generic Matter tag name (e.g. `Vacuum and Mop`) instead of the specific label used by the MyDyson app. These behaviours are controlled by the Apple Home app's implementation of the Matter RVC (Robot Vacuum Cleaner) specification and cannot be directly overridden by the plugin.

#### 🚧 Why does the `Vacuum then mop` mode appear in the suction power menu instead of under the Play button in Apple Home? 🚧

<!-- INCLUDES: issue-53-a66d -->
The grouping of cleaning modes in Apple Home is determined by the `ModeTag` values defined in the Matter specification. The plugin maps Dyson cleaning modes to these standard tags, but the Apple Home app interprets specific tags differently:

* Primary modes like `Mop` and `Vacuum` are typically displayed under the main Play button.
* Combination or modifier tags, such as `VacuumThenMop`, are often relegated to the secondary settings menu (the robot icon pill), where suction power levels are also found.

The plugin follows standard Matter tagging to ensure broad compatibility. Adding proprietary or non-standard tags to force a specific UI layout in Apple Home is avoided, as these are often unsupported by other Matter controllers and can lead to inconsistent behaviour.

## Diagnostic Logging

#### How can I capture comprehensive diagnostic logs for troubleshooting?

The plugin provides several debug flags to record detailed Dyson cloud REST API transactions and MQTT message payloads. This information is essential for diagnosing unexpected behaviour, API errors, or gathering telemetry for unsupported devices.

To enable comprehensive diagnostic logging, add the following to the plugin configuration:

```json
{
  "debug": true,
  "wildcardTopic": true,
  "debugFeatures": [
    "Log API Bodies",
    "Log MQTT Payloads as JSON",
    "Log Debug as Info"
  ]
}
```

Key configuration options:
- `debug`: Enables debug logging within the plugin.
- `wildcardTopic`: Monitors all appliance MQTT topics, including commands issued by the MyDyson app, to ensure no telemetry is missed.
- `Log API Bodies`: Captures HTTP request and response payloads for cloud REST API interactions, including map data and room definitions.
- `Log MQTT Payloads as JSON`: Formats and outputs raw MQTT event payloads in-full, instead of truncating long messages.
- `Log Debug as Info`: Elevates debug log statements to informational level. This ensures messages are recorded even if the Matterbridge environment or container host filters out standard debug-level logging.

When collecting logs for an issue report:
1. Record a complete cycle from start to finish. This should include initiating the clean, the full run, and any subsequent docking or maintenance operations (such as dust bin emptying, mop washing, and mop drying).
2. The plugin automatically masks sensitive values like appliance serial numbers and cloud authentication tokens. However, Matterbridge core logs (including Matter pairing passcodes) are outside the plugin control and must be redacted manually before sharing logs publicly.

#### What do extraneous fields or unrecognised MQTT message warnings in the logs mean?

<!-- INCLUDES: issue-51-051e -->
These warnings generally represent technical noise and do not indicate a functional failure of the plugin:

- **Extraneous fields**: This warning appears when the Dyson API returns data that the plugin was not expecting (e.g. `privacy.ai_recognize`). The plugin will continue to process all known fields, and these extra values are simply ignored.
- **Unrecognised MQTT messages**: Messages like `DysonMsg.msg = 'undefined'` or errors associated with `REQUEST-CURRENT-FAULTS` usually involve background diagnostic routines. These routines retrieve fault details to report them to Matter but do not affect the ability to control the appliance.

<!-- EXCLUDED: issue-1-59e4 issue-13-4541 issue-16-b5e2 issue-17-01c1 issue-26-2ae8 issue-31-833f issue-33-3d80 issue-46-423c issue-50-3ad7 issue-50-5d0d -->
