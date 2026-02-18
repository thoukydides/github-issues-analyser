# Frequently Asked Questions (FAQ)

## Home Connect

### Local/Remote Control

<!-- PARTITION -->

#### Why does my appliance show `No Response` when I try to start a program?

<!-- INCLUDES: issue-3-09c6 issue-79-56b4 -->
To protect your safety and prevent your appliance from starting unexpectedly, the Home Connect API requires **Remote Start** to be physically enabled on the appliance itself before remote control is allowed. This cannot be set via the API. Some appliances automatically expire Remote Start after a period of time or interactions such as opening the appliance door.

If you attempt to start a program via HomeKit when Remote Start is disabled, the plugin intentionally reports an error to HomeKit, which the Apple Home app displays as `No Response`. Reporting "Success" instead would be misleading, as the appliance would not actually start.

This plugin exposes the appliance's Remote Start status via the `Program Mode` characteristic on the power `Switch` service. It is not shown in the Home app, but can be viewed or used to gate automations in third-party apps like *Eve*.

#### What does `LockedByLocalControl` or "Local Intervention" mean?

<!-- INCLUDES: issue-1-9917 issue-2-206a issue-16-bbca -->
If you see an error like `Request cannot be performed temporarily! due to local actuated user intervention [BSH.Common.Error.LockedByLocalControl]`, it means the appliance is currently being operated via its physical buttons or knobs. This is a restriction built into the appliance firmware and the Home Connect API; it cannot be bypassed by the plugin.

To prevent conflicting commands and ensure safety, the Home Connect API blocks all remote control while a user is physically interacting with the appliance. This lockout usually clears a few seconds after you stop touching the controls, although some appliances may maintain the lockout for a longer period during certain maintenance cycles or until a specific manual interaction is completed.

This plugin exposes the appliance's Local Control status via the `Program Mode` characteristic on the power `Switch` service. It is not shown in the Home app, but can be viewed or used to gate automations in third-party apps like *Eve*.

### Programs and Options

<!-- PARTITION: Appliance Capabilities and HomeKit Integration -->

#### Why are some appliance features, programs, or options missing?

<!-- INCLUDES: issue-1-3c2c issue-3-9883 issue-44-70cc issue-62-1f79 issue-67-1639 issue-75-7835 issue-122-9466 issue-157-61a1 -->
The official Home Connect app and some third-party services use a private API with functionality not available to the public API used by this plugin. Because the plugin queries the API dynamically, it can only expose features permitted by the manufacturer. Specific limitations include:

* **Missing Programmes**: Some beverages (e.g. `Caffe Grande` or `Hot Water` on coffee machines) or cycles may not be exposed via the API for specific models or firmware versions.
* **Missing Options**: Certain settings, such as milk percentage for coffee drinks, are not currently provided by the public API.
* **Power Limitations**: Appliances like washers and dryers cannot be switched off via the API; they only support the `On` state.

To check for new features, ensure your appliance is on and restart Homebridge to trigger a re-read from the API. If a feature remains missing, verify its availability in the [Home Connect API Documentation](https://api-docs.home-connect.com) or [Contact Home Connect Developer Support](https://developer.home-connect.com/support/contact).

#### Why are some programs or options unable to be controlled or configured?

<!-- INCLUDES: issue-17-eee1 issue-29-d8b2 issue-50-fe74 issue-76-eaa5 issue-138-eb88 -->
The plugin discovers available programs and options during startup. This process may fail or result in restricted control if the appliance is disconnected, busy (e.g. running a cycle), blocked (e.g. door open, remote control disabled), or low on supplies. Other constraints include:

* **Monitoring vs Control**: Some programs (e.g. maintenance rinsing or user favourites) can be monitored by the API but not started remotely. The plugin logs these as unsupported if it cannot control them.
* **Custom Options**: Features like `half load` or `extra dry` for dishwashers are not independent switches; they must be configured as part of a specific program switch in your `config.json`. Manually defining programs disables the `auto` discovery for that appliance.

To resolve discovery issues, ensure the appliance is ready and use the HomeKit **Identify** function to trigger a rescan. Detailed logs will reveal internal names for programs and options required for manual configuration.

#### Why does the Apple Home app not show the remaining time or certain status info?

<!-- INCLUDES: issue-114-0f03 -->
The plugin exposes standard HomeKit characteristics like `Remaining Duration`, but the official Apple Home app restricts their visibility to specific accessory types (e.g. `Irrigation System`). It does not currently display this information for washing machines, dishwashers, or ovens. To view the remaining time and other hidden characteristics, use third-party HomeKit applications such as Home+ or Controller for HomeKit.

#### Why does the log show validation errors or unexpected API structures?

<!-- INCLUDES: issue-144-f92c issue-145-8923 -->
The plugin performs strict validation of API responses to ensure data integrity. Warnings about `Unexpected structure` or `Unexpected fields` (such as `displayvalue` or `null` values for an active program) occur when a physical appliance's firmware deviates from the official API specification. These messages are often informative and do not impact functionality. Most known discrepancies were addressed in version `v0.29.3`. If warnings persist, enable debug logging (`Log API Bodies`) and report the output on GitHub to allow the schema to be updated.

#### Why does the plugin report connection errors or claim no programs are supported?

<!-- INCLUDES: issue-27-2626 issue-155-6e9f -->
Errors such as `409 Conflict`, `SDK.Error.UnsupportedSetting`, or a report that an appliance supports no programs usually indicate server-side instability or a failure to reach the hardware. To troubleshoot:

1. Verify cloud connectivity by attempting to control the appliance via the official Home Connect app using cellular data (disabling Wi-Fi on your phone).
2. Check the appliance's network status in the official app; a stable connection is required.
3. If the error persists, stop Homebridge, delete the plugin's persistent cache files, and restart.

Persistent errors with universal settings like `PowerState` typically indicate a backend fault with the Home Connect service that must be addressed by their support team.

#### Why does my appliance status appear stuck or fail to update in HomeKit?

<!-- INCLUDES: issue-170-3230 -->
The plugin relies on a real-time event stream from Home Connect. If the appliance firmware or cloud servers fail to send a `STATUS` event (e.g. for a door opening), the plugin cannot update HomeKit. You can verify event reception by checking Homebridge logs for `Event STATUS`. Because of strict API rate limits, the plugin does not frequently poll for updates; it only refreshes the full status during startup or after a connection outage. If status changes are never reported, it may indicate a firmware bug or cloud service issue.

#### Why is there a delay when controlling appliances via HomeKit?

<!-- INCLUDES: issue-2-64eb -->
The Home Connect API is inherently high-latency, often taking several seconds to process a request. Additionally, the plugin must respect strict rate limits (e.g. maximum of 5 program starts per minute). To maintain reliability and avoid being blocked by the API, the plugin serialises multiple commands into sequential calls, which can result in a noticeable delay between a HomeKit action and the appliance response.

#### Why are ambient light settings missing for my hood or dishwasher?

<!-- INCLUDES: issue-24-3f2d -->
Ambient light capabilities are often only visible to the API when the light is switched on. Since `v0.18.1`, the plugin attempts to discover these settings by briefly toggling the light during initialisation. Note that brightness cannot be adjusted independently if the colour is set to `CustomColor`, as the brightness is embedded within the colour value itself. Ensure the appliance is reachable during plugin startup to allow this discovery to complete and be cached.

#### Why does my oven report authorisation errors when starting a program?

<!-- INCLUDES: issue-30-450a -->
This occurs when the plugin lacks the `Control` scope required for oven operation. While previously restricted, this permission was opened to developers in 2021. To resolve `Control scope has not been authorised` errors, ensure you are using `v0.20.0` or later and force a re-authorisation by deleting the cached token file in the plugin's `persist` directory and following the authorisation link in the logs after a restart.

<!-- PARTITION: Appliance Connection and Operation -->

#### Why does my appliance turn on automatically or Homebridge startup stall?

<!-- INCLUDES: issue-19-6db6 issue-20-4547 issue-72-9eb7 -->
To learn your model's specific options, the plugin must select each programme via the API. For many appliances, **programme options are only reported correctly when the power is on.**

At start-up, if the plugin does not have a valid cache, it will attempt to:
1. Turn the appliance on and wait for it to be ready.
2. Iterate through all available programmes to record their options.
3. Restore the appliance to its initial state.

This should only happen **once**. If it happens on every restart, it means the discovery failed to finish (e.g. due to the appliance being manually operated or missing supplies) and is being retried. If the appliance is offline and no valid cache exists, this initialisation process will stall until a connection is established.

#### Which settings are used for programmes started without specific options?

<!-- INCLUDES: issue-46-2122 -->
If you start a programme without custom options configured, the Home Connect server uses the **appliance defaults**. This is typically the factory default or the settings from the last time that programme was run manually.

To see these default values, enable **Debug Logging** and use the **Identify** function. The plugin will output a detailed list of every default value currently reported by the API.

#### Why do my oven programmes only run for one minute?

<!-- INCLUDES: issue-55-d41a issue-70-5614 -->
This is a quirk of the Home Connect API. Unlike manual operation, any oven programme started remotely **must** have a defined duration. If no duration is provided, the API uses a default value (usually 60 seconds).

To fix this, you must configure **Custom Programme Switches** in the plugin settings and explicitly set a `Duration` (e.g. `3600` seconds for 1 hour). This ensures the oven remains on until you manually stop it or the timer expires.

#### Why does the plugin report that the appliance is offline when the Home Connect app works?

<!-- INCLUDES: issue-40-f8f5 issue-61-1c74 issue-73-03ca -->
The Home Connect app can communicate with your appliances using two different methods: directly via your local Wi-Fi network or through the Home Connect cloud servers. In contrast, all third-party integrations, including this plugin, are restricted to using the official cloud API. If your appliance has a stable connection to your local network but is failing to connect to the Home Connect cloud servers, the official app will continue to function while the plugin will report `The appliance is offline`.

To troubleshoot:
1. Check the [Home Connect Service Status](https://www.thouky.co.uk/homeconnect.html) for known outages or `503` (Subsystem not available) errors. These are server-side issues that typically resolve themselves.
2. Test the official Home Connect app with your phone's Wi-Fi turned off. This forces the app to connect via the cloud. If it fails over cellular data, the issue is with the appliance's cloud connection.
3. In the official app, navigate to **Settings** > **Network** and verify that all connection stages are green.
4. Power cycle the appliance and your router to refresh the connection to the Home Connect servers.

#### Why does the log show `Too Many Requests` and a long wait time?

<!-- INCLUDES: issue-39-aa6b -->
The Home Connect API enforces a quota of **1000 requests per client and user account per day**. If this is exceeded, the API returns a `429 Too Many Requests` error and blocks activity for up to 24 hours.

Common reasons for hitting this limit include:
- **Unstable internet connection**: Frequent reconnections force the plugin to re-authenticate and re-sync states, consuming the quota.
- **Initial Setup**: Querying supported programmes and options for new appliances involves many requests.
- **Heavy HomeKit Usage**: Frequent manual control or complex automations.

The plugin identifies the lockout period and waits (e.g. `Waiting 86234 seconds`) before automatically reconnecting. If it does not recover after the wait, restart Homebridge and check logs in debug mode (`-D`).

#### Why does the power switch show an error or appear read-only?

<!-- INCLUDES: issue-83-53f1 issue-99-fe79 -->
This occurs when the Home Connect API provides inconsistent metadata about an appliance's capabilities. The plugin creates a HomeKit `Switch` but may restrict it based on the constraints reported by the server:

- **Invalid State Errors**: If you see `SDK.Error.InvalidSettingState`, the API reported the power state as writable, but the server rejected the command. This is common for fridges or hobs where power control is restricted for safety or firmware reasons.
- **Read-Only Status**: If the API incorrectly claims an appliance supports both `Off` and `Standby` (which violates the API spec), the plugin logs a warning and treats the power state as read-only to avoid sending invalid commands.

These are limitations of the Home Connect API implementation for specific hardware and cannot be fixed within the plugin. Control functionality typically resumes if the manufacturer corrects the device constraints in a firmware or cloud update.

#### Why do some appliances, like washers or dryers, always appear as ON?

<!-- INCLUDES: issue-72-52a3 -->
Many washing machines and dryers are designed as always-on devices in the Home Connect API. On these models, the `PowerState` only supports the value `On`. The plugin handles this by mapping the appliance's network connection status to the HomeKit switch:

1. **Connected**: The HomeKit switch is shown as **On**.
2. **Disconnected**: When the appliance is physically switched off or loses Wi-Fi, the plugin sets the switch to **Off**.

This behaviour was improved in `v0.23.6` to ensure the initial state is correctly synced at startup. Ensure you are running the latest version if the power state does not update correctly.

#### Why are features like dishwasher ambient light or ice makers missing?

<!-- INCLUDES: issue-42-1683 issue-94-e55f -->
Support for specific features depends on whether they are exposed via the official Home Connect public API. This is a manufacturer limitation, not a plugin defect.

- **Dishwasher Ambient Light**: Currently, the API only exposes ambient light control for hood appliances.
- **Ice Makers/Dispensers**: Control for `Refrigeration.Common.Setting.Dispenser.Enabled` was added in plugin version `v0.29.0` following an API update. If it still does not appear, your appliance firmware may not yet support this setting via the public API.

You can verify API support by running with debug logging (`-D`). If a feature is not listed in the appliance details or event stream, the plugin cannot expose it to HomeKit.

#### Why is my log filling up with `Event STATUS` temperature messages?

<!-- INCLUDES: issue-64-694f -->
These messages occur when the Home Connect servers report internal temperature changes. Many appliances (like ovens) monitor temperature even in standby, especially while cooling down. Messages may be more frequent if using Fahrenheit (`°F`) due to the higher sensitivity of the scale.

The plugin logs all information reported by the API. To prevent these messages from cluttering your main logs, it is recommended to run the plugin in a separate Homebridge child bridge. This isolates the high-volume events from your other accessories.

#### Why does my dishwasher trigger a Program Finished event when it reconnects?

<!-- INCLUDES: issue-66-f64f -->
Some appliances, particularly certain Bosch dishwashers, re-broadcast the `BSH.Common.Event.ProgramFinished` event when re-establishing a cloud connection. The plugin maps these API events directly to HomeKit triggers. Since the plugin does not filter these re-broadcasts, they appear as a new notification or button press. This is a quirk of the appliance firmware or API event handling.

#### Why does authorisation fail with an `invalid_request` error?

<!-- INCLUDES: issue-86-3b75 -->
This error indicates malformed credentials or invalid request parameters. Check the following:

1. **Client ID Format**: The `clientid` must be exactly 64 hexadecimal characters (0-9, A-F). Ensure no extra spaces or quotes are present.
2. **Production vs. Simulator**: Credentials for the "API Web Client" are for the simulator only. You must create a new application in the Home Connect developer portal to obtain a **Production** Client ID for physical appliances.
3. **Content Type**: Ensure your environment is not altering the headers of the request, as the API requires specific content types for authorisation.

#### Appliance Capabilities and HomeKit Integration

<!-- PARTITION -->

#### Why are some appliance features, programs, or options missing?

<!-- INCLUDES: issue-1-3c2c issue-3-9883 issue-44-70cc issue-62-1f79 issue-67-1639 issue-75-7835 issue-122-9466 issue-157-61a1 -->
The official Home Connect app and some third-party services use a private API with functionality not available to the public API used by this plugin. Because the plugin queries the API dynamically, it can only expose features permitted by the manufacturer. Specific limitations include:

* **Missing Programmes**: Some beverages (e.g. `Caffe Grande` or `Hot Water` on coffee machines) or cycles may not be exposed via the API for specific models or firmware versions.
* **Missing Options**: Certain settings, such as milk percentage for coffee drinks, are not currently provided by the public API.
* **Power Limitations**: Appliances like washers and dryers cannot be switched off via the API; they only support the `On` state.

To check for new features, ensure your appliance is on and restart Homebridge to trigger a re-read from the API. If a feature remains missing, verify its availability in the [Home Connect API Documentation](https://api-docs.home-connect.com) or [Contact Home Connect Developer Support](https://developer.home-connect.com/support/contact).

#### Why are some programs or options unable to be controlled or configured?

<!-- INCLUDES: issue-17-eee1 issue-29-d8b2 issue-50-fe74 issue-76-eaa5 issue-138-eb88 -->
The plugin discovers available programs and options during startup. This process may fail or result in restricted control if the appliance is disconnected, busy (e.g. running a cycle), blocked (e.g. door open, remote control disabled), or low on supplies. Other constraints include:

* **Monitoring vs Control**: Some programs (e.g. maintenance rinsing or user favourites) can be monitored by the API but not started remotely. The plugin logs these as unsupported if it cannot control them.
* **Custom Options**: Features like `half load` or `extra dry` for dishwashers are not independent switches; they must be configured as part of a specific program switch in your `config.json`. Manually defining programs disables the `auto` discovery for that appliance.

To resolve discovery issues, ensure the appliance is ready and use the HomeKit **Identify** function to trigger a rescan. Detailed logs will reveal internal names for programs and options required for manual configuration.

#### Why does the Apple Home app not show the remaining time or certain status info?

<!-- INCLUDES: issue-114-0f03 -->
The plugin exposes standard HomeKit characteristics like `Remaining Duration`, but the official Apple Home app restricts their visibility to specific accessory types (e.g. `Irrigation System`). It does not currently display this information for washing machines, dishwashers, or ovens. To view the remaining time and other hidden characteristics, use third-party HomeKit applications such as Home+ or Controller for HomeKit.

#### Why does the log show validation errors or unexpected API structures?

<!-- INCLUDES: issue-144-f92c issue-145-8923 -->
The plugin performs strict validation of API responses to ensure data integrity. Warnings about `Unexpected structure` or `Unexpected fields` (such as `displayvalue` or `null` values for an active program) occur when a physical appliance's firmware deviates from the official API specification. These messages are often informative and do not impact functionality. Most known discrepancies were addressed in version `v0.29.3`. If warnings persist, enable debug logging (`Log API Bodies`) and report the output on GitHub to allow the schema to be updated.

#### Why does the plugin report connection errors or claim no programs are supported?

<!-- INCLUDES: issue-27-2626 issue-155-6e9f -->
Errors such as `409 Conflict`, `SDK.Error.UnsupportedSetting`, or a report that an appliance supports no programs usually indicate server-side instability or a failure to reach the hardware. To troubleshoot:

1. Verify cloud connectivity by attempting to control the appliance via the official Home Connect app using cellular data (disabling Wi-Fi on your phone).
2. Check the appliance's network status in the official app; a stable connection is required.
3. If the error persists, stop Homebridge, delete the plugin's persistent cache files, and restart.

Persistent errors with universal settings like `PowerState` typically indicate a backend fault with the Home Connect service that must be addressed by their support team.

#### Why does my appliance status appear stuck or fail to update in HomeKit?

<!-- INCLUDES: issue-170-3230 -->
The plugin relies on a real-time event stream from Home Connect. If the appliance firmware or cloud servers fail to send a `STATUS` event (e.g. for a door opening), the plugin cannot update HomeKit. You can verify event reception by checking Homebridge logs for `Event STATUS`. Because of strict API rate limits, the plugin does not frequently poll for updates; it only refreshes the full status during startup or after a connection outage. If status changes are never reported, it may indicate a firmware bug or cloud service issue.

#### Why is there a delay when controlling appliances via HomeKit?

<!-- INCLUDES: issue-2-64eb -->
The Home Connect API is inherently high-latency, often taking several seconds to process a request. Additionally, the plugin must respect strict rate limits (e.g. maximum of 5 program starts per minute). To maintain reliability and avoid being blocked by the API, the plugin serialises multiple commands into sequential calls, which can result in a noticeable delay between a HomeKit action and the appliance response.

#### Why are ambient light settings missing for my hood or dishwasher?

<!-- INCLUDES: issue-24-3f2d -->
Ambient light capabilities are often only visible to the API when the light is switched on. Since `v0.18.1`, the plugin attempts to discover these settings by briefly toggling the light during initialisation. Note that brightness cannot be adjusted independently if the colour is set to `CustomColor`, as the brightness is embedded within the colour value itself. Ensure the appliance is reachable during plugin startup to allow this discovery to complete and be cached.

#### Why does my oven report authorisation errors when starting a program?

<!-- INCLUDES: issue-30-450a -->
This occurs when the plugin lacks the `Control` scope required for oven operation. While previously restricted, this permission was opened to developers in 2021. To resolve `Control scope has not been authorised` errors, ensure you are using `v0.20.0` or later and force a re-authorisation by deleting the cached token file in the plugin's `persist` directory and following the authorisation link in the logs after a restart.

#### Appliance Connection and Operation

<!-- PARTITION -->

#### Why does my appliance turn on automatically or Homebridge startup stall?

<!-- INCLUDES: issue-19-6db6 issue-20-4547 issue-72-9eb7 -->
To learn your model's specific options, the plugin must select each programme via the API. For many appliances, **programme options are only reported correctly when the power is on.**

At start-up, if the plugin does not have a valid cache, it will attempt to:
1. Turn the appliance on and wait for it to be ready.
2. Iterate through all available programmes to record their options.
3. Restore the appliance to its initial state.

This should only happen **once**. If it happens on every restart, it means the discovery failed to finish (e.g. due to the appliance being manually operated or missing supplies) and is being retried. If the appliance is offline and no valid cache exists, this initialisation process will stall until a connection is established.

#### Which settings are used for programmes started without specific options?

<!-- INCLUDES: issue-46-2122 -->
If you start a programme without custom options configured, the Home Connect server uses the **appliance defaults**. This is typically the factory default or the settings from the last time that programme was run manually.

To see these default values, enable **Debug Logging** and use the **Identify** function. The plugin will output a detailed list of every default value currently reported by the API.

#### Why do my oven programmes only run for one minute?

<!-- INCLUDES: issue-55-d41a issue-70-5614 -->
This is a quirk of the Home Connect API. Unlike manual operation, any oven programme started remotely **must** have a defined duration. If no duration is provided, the API uses a default value (usually 60 seconds).

To fix this, you must configure **Custom Programme Switches** in the plugin settings and explicitly set a `Duration` (e.g. `3600` seconds for 1 hour). This ensures the oven remains on until you manually stop it or the timer expires.

#### Why does the plugin report that the appliance is offline when the Home Connect app works?

<!-- INCLUDES: issue-40-f8f5 issue-61-1c74 issue-73-03ca -->
The Home Connect app can communicate with your appliances using two different methods: directly via your local Wi-Fi network or through the Home Connect cloud servers. In contrast, all third-party integrations, including this plugin, are restricted to using the official cloud API. If your appliance has a stable connection to your local network but is failing to connect to the Home Connect cloud servers, the official app will continue to function while the plugin will report `The appliance is offline`.

To troubleshoot:
1. Check the [Home Connect Service Status](https://www.thouky.co.uk/homeconnect.html) for known outages or `503` (Subsystem not available) errors. These are server-side issues that typically resolve themselves.
2. Test the official Home Connect app with your phone's Wi-Fi turned off. This forces the app to connect via the cloud. If it fails over cellular data, the issue is with the appliance's cloud connection.
3. In the official app, navigate to **Settings** > **Network** and verify that all connection stages are green.
4. Power cycle the appliance and your router to refresh the connection to the Home Connect servers.

#### Why does the log show `Too Many Requests` and a long wait time?

<!-- INCLUDES: issue-39-aa6b -->
The Home Connect API enforces a quota of **1000 requests per client and user account per day**. If this is exceeded, the API returns a `429 Too Many Requests` error and blocks activity for up to 24 hours.

Common reasons for hitting this limit include:
- **Unstable internet connection**: Frequent reconnections force the plugin to re-authenticate and re-sync states, consuming the quota.
- **Initial Setup**: Querying supported programmes and options for new appliances involves many requests.
- **Heavy HomeKit Usage**: Frequent manual control or complex automations.

The plugin identifies the lockout period and waits (e.g. `Waiting 86234 seconds`) before automatically reconnecting. If it does not recover after the wait, restart Homebridge and check logs in debug mode (`-D`).

#### Why does the power switch show an error or appear read-only?

<!-- INCLUDES: issue-83-53f1 issue-99-fe79 -->
This occurs when the Home Connect API provides inconsistent metadata about an appliance's capabilities. The plugin creates a HomeKit `Switch` but may restrict it based on the constraints reported by the server:

- **Invalid State Errors**: If you see `SDK.Error.InvalidSettingState`, the API reported the power state as writable, but the server rejected the command. This is common for fridges or hobs where power control is restricted for safety or firmware reasons.
- **Read-Only Status**: If the API incorrectly claims an appliance supports both `Off` and `Standby` (which violates the API spec), the plugin logs a warning and treats the power state as read-only to avoid sending invalid commands.

These are limitations of the Home Connect API implementation for specific hardware and cannot be fixed within the plugin. Control functionality typically resumes if the manufacturer corrects the device constraints in a firmware or cloud update.

#### Why do some appliances, like washers or dryers, always appear as ON?

<!-- INCLUDES: issue-72-52a3 -->
Many washing machines and dryers are designed as always-on devices in the Home Connect API. On these models, the `PowerState` only supports the value `On`. The plugin handles this by mapping the appliance's network connection status to the HomeKit switch:

1. **Connected**: The HomeKit switch is shown as **On**.
2. **Disconnected**: When the appliance is physically switched off or loses Wi-Fi, the plugin sets the switch to **Off**.

This behaviour was improved in `v0.23.6` to ensure the initial state is correctly synced at startup. Ensure you are running the latest version if the power state does not update correctly.

#### Why are features like dishwasher ambient light or ice makers missing?

<!-- INCLUDES: issue-42-1683 issue-94-e55f -->
Support for specific features depends on whether they are exposed via the official Home Connect public API. This is a manufacturer limitation, not a plugin defect.

- **Dishwasher Ambient Light**: Currently, the API only exposes ambient light control for hood appliances.
- **Ice Makers/Dispensers**: Control for `Refrigeration.Common.Setting.Dispenser.Enabled` was added in plugin version `v0.29.0` following an API update. If it still does not appear, your appliance firmware may not yet support this setting via the public API.

You can verify API support by running with debug logging (`-D`). If a feature is not listed in the appliance details or event stream, the plugin cannot expose it to HomeKit.

#### Why is my log filling up with `Event STATUS` temperature messages?

<!-- INCLUDES: issue-64-694f -->
These messages occur when the Home Connect servers report internal temperature changes. Many appliances (like ovens) monitor temperature even in standby, especially while cooling down. Messages may be more frequent if using Fahrenheit (`°F`) due to the higher sensitivity of the scale.

The plugin logs all information reported by the API. To prevent these messages from cluttering your main logs, it is recommended to run the plugin in a separate Homebridge child bridge. This isolates the high-volume events from your other accessories.

#### Why does my dishwasher trigger a Program Finished event when it reconnects?

<!-- INCLUDES: issue-66-f64f -->
Some appliances, particularly certain Bosch dishwashers, re-broadcast the `BSH.Common.Event.ProgramFinished` event when re-establishing a cloud connection. The plugin maps these API events directly to HomeKit triggers. Since the plugin does not filter these re-broadcasts, they appear as a new notification or button press. This is a quirk of the appliance firmware or API event handling.

#### Why does authorisation fail with an `invalid_request` error?

<!-- INCLUDES: issue-86-3b75 -->
This error indicates malformed credentials or invalid request parameters. Check the following:

1. **Client ID Format**: The `clientid` must be exactly 64 hexadecimal characters (0-9, A-F). Ensure no extra spaces or quotes are present.
2. **Production vs. Simulator**: Credentials for the "API Web Client" are for the simulator only. You must create a new application in the Home Connect developer portal to obtain a **Production** Client ID for physical appliances.
3. **Content Type**: Ensure your environment is not altering the headers of the request, as the API requires specific content types for authorisation.

### Home Connect Errors

## HomeKit Services

### Notifications & Events

<!-- PARTITION -->

#### Why does my appliance appear as `Stateless Programmable Switch` buttons?

<!-- INCLUDES: issue-1-38d2 issue-3-c53c issue-43-caee issue-45-fb59 issue-153-91f4 -->
Home Connect communicates many appliance states as **transient events** (e.g. "Drip tray full" or "iDos fill level poor") rather than persistent, queryable states. It is not possible for the plugin to poll the current state (e.g. after a reboot), and many appliances do not reliably generate events when a condition clears.

These events map to `Stateless Programmable Switch` services, allowing them to be used as automation triggers. Other types like `Contact Sensor` are not used because they require a persistent state that cannot be determined reliably, leading to a poor user experience.

The Apple Home app only displays numeric labels (Button 1, Button 2). To see what these represent, check your **Homebridge logs** during startup or use a third-party app like **Eve** or **Home+** which displays descriptive labels. For dishwasher appliances, the buttons are typically mapped as follows:
1. **Programme Finished**
2. **Programme Aborted**
3. **Salt Low**
4. **Rinse Aid Low**

#### Why does the Home app show multiple tiles for a single appliance?

<!-- INCLUDES: issue-59-593e -->
This is standard Apple Home behaviour. To keep the interface organised, Apple separates different service types into distinct tiles. Specifically, a separate tile is created for the `Stateless Programmable Switch` services used for event triggers.

While you can toggle **Show as Separate Tiles**, Apple does not currently allow these buttons to be merged into the primary appliance tile. If you do not use these events for automations, you can disable them in the plugin configuration to prevent them from appearing in the Home app.

#### How can I receive push notifications for appliance events?

<!-- INCLUDES: issue-38-9780 issue-63-11e1 -->
Apple Home only supports native push notifications for specific security-related sensors (Doors, Locks, Smoke, etc.). Most Home Connect events do not fit these categories; forcing them to do so would result in misleading notification text.

To receive notifications for other events, you have two main options:

* **The Official Home Connect App:** The most reliable way to get detailed, text-based push notifications.
* **HomeKit Automations:** Trigger an action via a `Stateless Programmable Switch`. You can generate a HomeKit notification indirectly by having the automation toggle a [homebridge-dummy](https://github.com/mpatfield/homebridge-dummy) Contact Sensor, which *does* support native alerts.

#### Can I view the remaining programme time in the Home app?

<!-- INCLUDES: issue-48-237c -->
The remaining duration is available via the `RemainingTime` characteristic on the main `Active Program` switch service, but there are limitations on how it is displayed.

Apple's Home app generally only displays the `Remaining Duration` characteristic for specific accessory types defined in the HomeKit Accessory Protocol (HAP) specification, such as `Irrigation System` and `Valve` accessories. As appliances do not fall into these categories, the value will not be visible in the native Home app.

To view the remaining time or use it to trigger automations, you must use a third-party HomeKit app (such as **Controller for HomeKit** or **Eve**) that supports displaying non-standard characteristics for appliance services.

#### Why are the power and programme switches displayed in a random order?

<!-- INCLUDES: issue-7-36fe -->
The HomeKit Accessory Protocol (HAP) does not provide a robust way for plugins to enforce the display order of multiple services within a single accessory. While the plugin exposes several services (such as the power `Switch` and various programme control `Switch` services), individual HomeKit apps determine how to order them.

Attempts to use HAP features like **Primary** or **Linked** services have not consistently improved ordering across different applications; in some cases, these changes made the Apple Home app's ordering less predictable. Most third-party HomeKit apps, such as **Eve**, **Home+**, or **Hesperus**, allow users to manually reorder services or characteristics for an accessory within their own interfaces.

#### How can I reduce the number of switches shown for an appliance?

<!-- INCLUDES: issue-49-3c91 -->
By default, the plugin creates individual switches for every supported programme of an appliance. For devices with many cycles, such as washers or dryers, this can result in dozens of switches cluttering the interface. 

To simplify the interface, you can enable the **No individual program switches** option in the plugin configuration (either globally or for a specific appliance). This suppresses the individual cycle switches while maintaining core functionality such as status monitoring, timers, and power controls.

#### Why does my coffee maker stay On in HomeKit after entering auto-standby?

<!-- INCLUDES: issue-35-2eee -->
Some coffee makers, particularly certain Siemens models like the TI95 series, do not reliably emit a `PowerState` change event through the Home Connect API when they automatically transition to standby mode. This results in the HomeKit power switch remaining **On** even though the appliance is inactive.

The plugin includes a workaround by monitoring `BSH.Common.Status.OperationState`. When the appliance reports it has become `Inactive`, the plugin infers that the power has been switched off. This logic was implemented in version `v0.18.3`. If you encounter this, ensure you are running the latest version and have not disabled status updates in your configuration. Note that the plugin treats both `Off` and `Standby` as **Off** for the purposes of the HomeKit power switch.

## Third-party Platforms

<!-- PARTITION -->

#### Is this plugin compatible with HOOBS?

<!-- INCLUDES: issue-37-c1f5 issue-67-ea33 issue-76-b91b -->
Yes, but it is not officially supported.

This plugin is designed and tested for vanilla [Homebridge](https://github.com/homebridge/homebridge) with [Homebridge Config UI X](https://github.com/homebridge/homebridge-config-ui-x). If you choose to use HOOBS, you may encounter stability issues or broken features.

Support policy for HOOBS users:

1. **Contact HOOBS Support:** Your first point of contact should be [HOOBS Support](https://support.hoobs.org/ticket) for platform-specific issues.
2. **Verify on Vanilla Homebridge:** Before [opening an issue](https://github.com/thoukydides/homebridge-homeconnect/issues/new/choose), you must verify the problem persists on a standard Homebridge installation.
3. **No HOOBS-Specific Fixes:** Bug reports or feature requests specifically for HOOBS compatibility will **not** be accepted.

#### Will there be a Home Assistant version of this plugin?

<!-- INCLUDES: issue-14-2728 -->
No. This plugin is specifically designed for Homebridge to provide HomeKit integration for Home Connect appliances. The maintainer does not use Home Assistant and has no plans to develop or maintain a version for that platform.

For Home Assistant users, there are alternative community-maintained integrations available for Home Connect appliances.

#### Why not support IFTTT integration for features missing from the Home Connect API?

<!-- INCLUDES: issue-23-d116 -->
IFTTT exposes some functionality that is not available via the official Home Connect API. However, integration with IFTTT has been explicitly declined to maintain plugin stability and avoid architectural complexity. The maintainer's rationale includes several key technical and design constraints:

* **Complexity and Maintenance**: Implementing a hybrid control system where some actions use the Home Connect API and others use IFTTT would create significant code complexity and "feature creep".
* **User Configuration Burden**: Direct integration would rely on users manually creating appropriate IFTTT applets and then precisely configuring this plugin to match, which is prone to user error.
* **Interface Clutter**: Adding additional manual switches for IFTTT actions would further clutter the HomeKit interface, making the existing list of program switches more difficult to navigate.
* **Free Plan Limitations**: The IFTTT free tier supports a maximum of two applets, and some Home Connect features are only available via a "Pro+" plan, so most users would receive limited benefit.

For users who require IFTTT-specific functionality, such as triggering automations from Hood Favourite button presses, it is recommended to use a dedicated plugin such as `homebridge-ifttt` alongside this one. This approach keeps the logic for different services separate and more manageable.

## New category

### General Troubleshooting and API Behaviour

<!-- PARTITION -->

#### How can I find the `haId` (Home Appliance ID) for my appliance?

<!-- INCLUDES: issue-1-2779 -->
The `haId` is a unique identifier required for customising appliance configurations in `config.json`. You can find this value in several ways:

1. In HomeKit apps, it is displayed as the appliance's **Serial Number**.
2. By using the **Identify** function on the accessory within your HomeKit app, which will write the full appliance details (including the `haId`) to the Homebridge log.
3. When debug mode is enabled (`DEBUG=*`), the `haId` is included in almost all log entries and Home Connect request URLs.

The format typically follows a pattern like `MANUFACTURER-MODEL-HEXADECIMAL_ID`.

#### Why does the Eve app show my appliance as "Inactive" when it is idle?

<!-- INCLUDES: issue-1-96fa -->
When an appliance is switched on but not currently running a program, its state is logically **Inactive**. The Eve app specifically chooses to highlight this status in a way that can appear like a warning or an error. This is a user interface decision made by the Eve app developers; other HomeKit applications do not typically treat the idle state as a negative status.

#### Why am I seeing `SDK.Error.HomeAppliance.Connection.Initialization.Failed` in my logs?

<!-- INCLUDES: issue-1-e985 issue-113-d74c -->
This error is returned by the Home Connect API and indicates that the cloud servers were unable to communicate with your physical appliance. It is not an authentication issue and cannot be resolved by regenerating tokens or re-authorising the plugin.

According to the Home Connect API documentation, this occurs when:
1. The appliance is offline or powered down.
2. The appliance failed to respond to connection requests within the required timeout.
3. There are transient connectivity issues between the appliance, your local network, and the Home Connect servers.

Verify if the appliance is controllable via the official Home Connect mobile app. Often, the issue is caused by temporary instability in the Home Connect server infrastructure or local Wi-Fi and will resolve itself without intervention.

#### Why do appliance services have generic names in the Apple Home app since iOS 16?

<!-- INCLUDES: issue-108-a5c4 issue-116-e2ec -->
iOS 16 introduced changes to how the Home app displays names for accessories containing multiple services, often defaulting to the name of the parent accessory rather than unique service names (e.g. specific dishwasher programs).

The plugin (from version 0.27.0 onwards) includes the `Configured Name` characteristic for `Switch`, `Stateless Programmable Switch`, and `Lightbulb` services to mitigate this. To resolve naming issues:

1. Ensure you are running version 0.27.0 or later of the plugin.
2. Note that `Stateless Programmable Switch` services may still appear as numeric buttons due to iOS limitations. Third-party apps like **Eve** or **Home+** may display these more clearly.
3. If names do not update automatically, you can manually rename individual services within the Home app settings for that accessory.

#### Why does my appliance occasionally show as not available or return `SDK.Error.504.GatewayTimeout`?

<!-- INCLUDES: issue-11-d4f5 -->
The `SDK.Error.504.GatewayTimeout` error indicates that the Home Connect cloud servers are experiencing internal issues or high latency. This is a server-side problem with the Home Connect API infrastructure and is not caused by the plugin. 

You may observe that an appliance remains responsive within the official Home Connect mobile app while failing via HomeKit, as the app and the public API can use different communication paths. Frequent occurrences usually indicate transient instability in the Home Connect service.

#### Why does the power button for my oven not work?

<!-- INCLUDES: issue-112-6c3a -->
Failure to power an oven on or off is frequently attributed to a bug in the Home Connect API affecting specific models where power commands are ignored or rejected. 

If you experience this, please report it directly to [Home Connect Developer Support](https://developer.home-connect.com/support/contact) with your appliance's part number (E-Nr). This is an external platform limitation that cannot be resolved through plugin updates.

#### Why am I getting the error `client has limited user list - user not assigned to client [invalid_client]`?

<!-- INCLUDES: issue-115-c713 -->
This error indicates that the account used to log in is not authorised to use the specific Developer Application you created in the [Home Connect Developer Portal](https://developer.home-connect.com/).

To resolve this, verify these settings in the portal:
1. The **Home Connect User Account for Testing** field within your application settings must exactly match the email address used for your Home Connect mobile app.
2. Verify the **Default Home Connect User Account for Testing** in your developer profile settings.
3. If you have migrated to **SingleKey ID**, ensure your developer profile and application settings reflect the updated email address.

If the configuration is correct but the error persists, contact [Home Connect Developer Support](https://developer.home-connect.com/support/contact) as it may indicate a server-side account issue.

#### What does the error `BSH.Common.Error.WriteRequest.Busy` mean?

<!-- INCLUDES: issue-116-1125 -->
This error is returned by the Home Connect cloud servers when a command is sent to an appliance that is currently unable to process it. 

Common causes include:
* The appliance requires physical interaction (e.g. emptying a drip tray or filling a water tank).
* The appliance state prevents the command (e.g. starting a program while a door is open).
* Transient issues with the Home Connect cloud service.

Check the physical display of the appliance or the official Home Connect app to see if a manual action is required.

#### Why does the plugin fail with `request rejected by client authorization authority (developer portal)`?

<!-- INCLUDES: issue-117-1a0f -->
This error indicates the authorisation request was rejected by Home Connect servers due to a configuration mismatch in the [Home Connect Developer Portal](https://developer.home-connect.com/applications).

Verify the following:
1. **Client ID**: Ensure the `Client ID` in the plugin exactly matches your developer account. Even one incorrect character will cause failure.
2. **Success Redirect**: Ensure a valid URL is entered in the **Success Redirect** field of your application. If this is empty or invalid, the API will return a `400 unauthorized_client` error.

If settings are correct but the error persists, try deleting and recreating the application in the developer portal.

#### Why does SingleKey ID show a session expired error or fail to redirect during authorisation?

<!-- INCLUDES: issue-118-9a71 -->
Authorisation issues after receiving the login URL are typically caused by the Home Connect or SingleKey ID services. The SingleKey ID website may fail to redirect back to the plugin due to restrictive Content Security Policy (CSP) directives.

Workaround steps:
1. Restart the authorisation process.
2. On the SingleKey ID login screen, check the **Stay logged in** option.
3. If the page stalls after signing in, open your browser's developer tools (`F12`), locate the callback URL in the network logs, and manually navigate to it to complete the process.

#### Why do I get a `Device authorization session has expired` error during setup?

<!-- INCLUDES: issue-121-ccc6 -->
This occurs when the SingleKey ID account is not fully configured or verified. To resolve:

1. Open the official Home Connect app on your mobile device.
2. Ensure you are logged in with the same SingleKey ID used for the plugin.
3. Verify your account profile is complete and all email verifications or terms of service have been accepted.
4. Restart the plugin and attempt authorisation again once the account is fully functional in the mobile app.

#### Can I disable the power or active program switches for my appliance?

<!-- INCLUDES: issue-124-2e72 -->
You can control which individual program switches are provided using the `addprograms` option in `config.json`. However, the `Switch` services for appliance power and the active program are fundamental to the plugin's architecture and cannot be disabled. To avoid accidental activation, you can move these switches to a different room or a "Technical" zone within the Home app.

#### Why is the remaining program time or current stage not visible in the Home app?

<!-- INCLUDES: issue-124-9bb6 -->
There are two primary reasons:

1. **API Limitations**: Most Home Connect appliances (except the Roxxter robot) do not report specific stages like "rinsing". They only provide elapsed time, remaining time, and percentage completion.
2. **HomeKit Display**: The official Apple Home app does not support displaying the `Remaining Program` characteristic. To see this information, you must use a third-party HomeKit app that supports a wider range of characteristic types.

#### How can I get notifications for program completion or low detergent levels?

<!-- INCLUDES: issue-124-8aea -->
The Apple Home app only provides native notifications for security-related characteristics (e.g. doors). It does not support native notifications for appliance program states or consumables.

You can use the `Stateless Programmable Switch` services provided by the plugin for events like `Program Finished` or `i-Dos Low` to create HomeKit automations that trigger custom actions or third-party notifications.

#### Why do I get "The code entered is invalid or has expired" when authenticating?

<!-- INCLUDES: issue-125-9208 -->
This typically occurs during the OAuth process for three reasons:

1. **Propagation Delay**: Changes in the Home Connect Developer Portal can take up to 15 minutes to synchronise. Wait 15 minutes before authenticating a new application.
2. **Code Expiration**: Verification codes for the `device_verify` URL are only valid for 10 minutes.
3. **Stale UI Links**: The Homebridge Config UI X link does not update automatically. Close and re-open the configuration editor, or check the Homebridge logs for a fresh URL (logged every 10 minutes).

#### Why are there no log entries for several hours even though the plugin is running?

<!-- INCLUDES: issue-13-159f -->
If appliances are idle and no status changes occur, the plugin remains silent. Log entries are only generated when an appliance is controlled, a state change is reported, or an error occurs. With debug logging (`-D`) enabled, the plugin polls the appliance list approximately once per hour. The absence of logs does not indicate that the plugin has frozen.

#### What does a `Proxy Error` or `getaddrinfo EAI_AGAIN` in the logs mean?

<!-- INCLUDES: issue-13-daa9 issue-137-6081 -->
These indicate network-level issues:

* **Proxy Error**: The Home Connect API servers unexpectedly terminated the event stream. This is a server-side issue; the plugin will automatically attempt to reconnect.
* **getaddrinfo EAI_AGAIN**: A temporary failure in DNS resolution. Ensure your Homebridge host has a stable internet connection and that your DNS provider is not blocking `api.home-connect.com`. This is a local environment issue that cannot be resolved via plugin configuration.

#### Why does the ice maker toggle not appear for my Home Connect fridge?

<!-- INCLUDES: issue-141-5245 -->
Control of the ice maker (via the `Refrigeration.FridgeFreezer.Setting.DispenserEnabled` setting) was added in version 0.29.0. 

If the control is missing, it indicates the appliance firmware or model does not support this setting through the public API. The plugin can only expose functionality that the Home Connect API explicitly provides; some features available in the official app are not yet part of the public API.

### Home Connect API and Connectivity

<!-- PARTITION -->

#### Why does the log show `The appliance is offline` when it is connected in the Home Connect app?

<!-- INCLUDES: issue-15-25d9 -->
The `The appliance is offline` message indicates that the plugin has lost its connection to the Home Connect **Event Stream** or failed to synchronise the appliance's state. The plugin relies on this persistent stream for real-time updates; if it is interrupted, the appliance is flagged as offline to prevent operations based on outdated information.

This status specifically refers to the API's event-based connection rather than the appliance's local Wi-Fi status. It is possible for an appliance to appear functional in the official Home Connect app (which can use alternative communication methods) while being reported as offline in Homebridge if the event stream is unavailable. Ensure your network allows persistent outgoing connections and check for any Home Connect service interruptions.

#### Why does the Home Connect authorisation link in the settings expire or fail?

<!-- INCLUDES: issue-151-9c3a -->
The authorisation URI generated by the plugin for linking your account is subject to technical constraints from the Home Connect servers:

* The authorisation link is only valid for **30 minutes**. You must complete the process within this window; otherwise, the link will become invalid.
* If the link fails or has expired, refresh the plugin configuration page or restart Homebridge to generate a new URI.
* If the link is displayed as `[object Promise]` or `https://.../[object%20Promise]`, ensure you have updated the plugin to at least `v0.29.5`. This was a display issue in earlier versions where the link generation was not correctly awaited in the user interface.

#### Why does the plugin report `401 Unauthorized` with the error `client has limited user list - user not assigned to client`?

<!-- INCLUDES: issue-162-1a03 -->
This error is generated by the Home Connect authorisation servers and indicates that the account attempting to login (your SingleKey ID or Home Connect email) has not been correctly associated with the application created in the Home Connect Developer Portal.

Common causes and solutions include:
1. **Configuration mismatch**: Verify that the `clientid` in your Homebridge configuration exactly matches the Client ID provided in the Home Connect Developer Portal.
2. **Account consistency**: Ensure you are attempting to authorise using the same email address registered in both the Home Connect mobile app and the Developer Portal.
3. **Propagation delay**: If you have recently created the application or changed settings in the Developer Portal, it can take up to 48 hours for these changes to synchronise across the Home Connect infrastructure. If the configuration is correct, waiting for this period often resolves the issue automatically.

#### Why do I see `InvalidStepSize`, `SDK.Error.InvalidOptionValue`, or `SDK.Error.InvalidSettingState` errors?

<!-- INCLUDES: issue-18-1fff issue-22-3aca -->
These errors indicate the Home Connect API has rejected a command due to its current state or an invalid parameter:

* **InvalidStepSize / InvalidOptionValue**: Certain program options (e.g. `FillQuantity` or `StartInRelative`) must be exact multiples of a specific step size. The plugin attempts to mitigate this in the Homebridge UI by providing dropdowns or descriptive step sizes. Ensure manual entries are multiples of the required increment.
* **InvalidSettingState**: This occurs when an appliance cannot process remote commands, typically because a maintenance message (e.g. "Change water filter" or "Descaling required") is displayed on the physical appliance screen. Because the API does not always provide specific details about these prompts to the plugin, you must resolve the prompt on the appliance's physical control panel before remote control can resume.

#### Why does the log show `Gateway Timeout`, `Proxy Error`, or `Service Temporarily Unavailable`?

<!-- INCLUDES: issue-19-6154 issue-34-01de -->
These errors (`SDK.Error.504.GatewayTimeout`, `Proxy Error`, or HTTP 503) are returned directly by the Home Connect API servers and indicate instability or maintenance in their backend infrastructure. 

The public API used by third-party integrations often experiences issues independently of the official Home Connect mobile app. This is a known limitation of the service's reliability that the plugin cannot fix. During such outages, you may see the plugin rapidly log attempts to restart the event stream. This is a deliberate design choice to ensure:
1. **State Consistency**: Reconnecting immediately minimises the window for missed events and stale data once service resumes.
2. **Diagnostic Integrity**: Precise logs of every connection attempt are vital for diagnosing complex or intermittent API failures.

The plugin is optimised to stay within rate limits and will automatically resume normal operation once the Home Connect servers are responsive.

#### Why is a specific appliance program or feature showing as `Not Responding` while others work?

<!-- INCLUDES: issue-26-a87b issue-42-9162 -->
This behaviour often indicates that the plugin's cached list of supported programs or features for that specific appliance has become stale, possibly after an appliance firmware update or a change in the Home Connect server-side configuration.

### Refresh via Identify
The simplest way to force the plugin to refresh the list of supported programs is to use the **Identify** function within HomeKit (found in the accessory settings for the appliance). This will re-read all supported programs and options from the API and update the cached metadata.

### Clearing Persistent Cache
If the `Identify` method does not resolve the issue, you can manually clear the plugin's cache:
1. Stop Homebridge.
2. Navigate to the `persist` directory (usually `~/.homebridge/homebridge-homeconnect/persist`).
3. Identify the file starting with `94a08da1fecbb6e8b46990538c7b50b2` (your account authorisation). **Do not delete this file**.
4. Delete all other files in that directory.
5. Restart Homebridge.

If you see the error `[SDK.Error.HomeAppliance.Connection.Initialization.Failed]` in your logs, the Home Connect servers are having trouble reaching your appliance, which may also cause individual programs to fail.

#### Why does the log show a program running or time remaining when my appliance is off?

<!-- INCLUDES: issue-5-4389 -->
The plugin logs and displays status information exactly as it is received from the **Home Connect API** server. If the logs indicate that a program is active or showing a countdown (e.g. `Program 1858 seconds remaining`) while the appliance is physically off, it means the Home Connect server is out of sync with the hardware.

You can try to resolve this by starting and then stopping a manual program using the official Home Connect app to reset the server state. If the issue persists, it may require re-registering your **Client ID** or contacting Home Connect support, as the plugin cannot correct invalid data sent by the API.

#### Why is the Home Connect plugin not starting or showing an authorisation URL?

<!-- INCLUDES: issue-28-b9b5 -->
If the plugin is not providing an authorisation URL, it is usually due to a configuration error in `config.json` preventing Homebridge from identifying the platform.

Check your Homebridge logs for `[HomeConnect] Initializing HomeConnect platform...`. If this line is absent, the platform entry may be incorrectly nested (e.g. inside another plugin's configuration block) or missing from the `platforms` array entirely. 

Ensure the `clientid` property is set. Once correctly initialized, the plugin will log a URL like `https://verify.home-connect.com?user_code=XXXX-XXXX`. You must visit this URL in a browser to approve the request. If you receive an error regarding HTTP methods, ensure you are visiting the full `verify.home-connect.com` URL and not the API token endpoints directly.

#### Why do my other Homebridge plugins show `No Response` after installing this plugin?

<!-- INCLUDES: issue-164-bbc4 -->
Homebridge plugins operate in isolation; the Home Connect plugin cannot directly interfere with other plugins. If multiple unrelated plugins show `No Response`, it typically indicates a problem at the Homebridge process level or with the HomeKit pairing state.

To troubleshoot:
1. Check logs to see if the entire Homebridge process is crashing. Using **Child Bridges** for your plugins can prevent one plugin from affecting the whole bridge.
2. Ensure Node.js and `npm` are updated to the recommended versions.
3. If the issue persists, it may be due to HomeKit database inconsistencies. Removing and re-adding the Homebridge bridge to the Home app may be required.
4. Enable debug logging with the `-D` flag and `DEBUG=*` environment variable to capture HomeKit Accessory Protocol (HAP) interactions.

### General Troubleshooting and Configuration

<!-- PARTITION -->

#### Why can I not see the program status, remaining time, or pause/resume options in the Home app?

<!-- INCLUDES: issue-5-1a70 issue-8-226b issue-68-c945 -->
Apple's standard **Home app** often only displays a simple power switch for many appliances. Detailed information such as **Active** status, **Remaining Program Time**, and **Pause/Resume** controls use characteristics that are not prominently displayed by Apple's interface. To access these features, you must use a third-party HomeKit app that supports a wider range of characteristic types, such as **Eve for HomeKit**, **Home+**, or **Controller for HomeKit**.

The plugin adds the `RemainingDuration` characteristic to the **Active Program Switch** and implements experimental pause/resume support via the `Active` characteristic. Using different service types (such as a `Valve` service for timers) is avoided to maintain a consistent architectural model across different hardware types and to prevent breaking existing automations.

#### How do I complete the Home Connect authorisation process?

<!-- INCLUDES: issue-60-6eaf issue-82-2ddc issue-97-1958 -->
When the plugin starts or requires re-authorisation, it generates a unique URL in the Homebridge log. To complete the process:

1. Copy the entire URL (e.g. `https://api.home-connect.com/security/oauth/device_verify?user_code=1234-5678`) into your web browser. The session is typically valid for 10 minutes; if it expires or is used more than once, the log will show an `expired_token` error and the plugin will retry after 60 seconds.
2. Log in using the **same email address** and password used for the official Home Connect mobile app. Note that Home Connect has transitioned to SingleKey ID for authentication.
3. Ensure your email address is entered in **all lowercase letters**. The Home Connect backend performs case-sensitive comparisons, and mismatched casing can result in `invalid_client` errors.
4. Approve the request. You will be redirected to the `Redirect URI` specified in your developer application. The plugin will then automatically detect the completion and retrieve the tokens.

Avoid using 'plus' email addresses (e.g. `user+homebridge@example.com`) as they are inconsistently supported across the Home Connect and SingleKey ID systems.

#### What settings should I use for my application on the Home Connect Developer Portal?

<!-- INCLUDES: issue-51-db9a issue-60-3cca -->
When registering your application on the [Home Connect Developer Portal](https://developer.home-connect.com/applications), ensure the following configuration:

* **OAuth Flow**: This **must** be set to `Device Flow`. This cannot be changed after the application is created; if you selected a different flow, you must create a new application. Incorrect flow settings will result in an `Unauthorized client: grant_type is invalid` error.
* **Client ID**: Copy the 64-character hexadecimal string. Do not use the `API Web Client ID` provided by default in new accounts, as it is reserved for the official web client.
* **Redirect URI**: This field is mandatory but unused by the `Device Flow`. You can enter any valid URL, such as `https://localhost`.

Ensure the `simulator` option in your Homebridge configuration is set to `false` (the default) unless you are specifically testing against virtual appliances.

#### Why does the log show `request rejected by client authorization authority (developer portal)`?

<!-- INCLUDES: issue-82-05c8 -->
This error is returned by the Home Connect servers when the provided `Client ID` is not recognised. This is typically caused by:

1. **Incorrect ID type**: Ensure you have copied the 64-character hexadecimal `Client ID`. Do not use the `Client Secret` or the ID associated with the default `API Web Client`.
2. **Propagation delay**: New applications can take several minutes or even an hour to propagate to the production authorisation servers. If the ID is correct, wait a short while and restart Homebridge.
3. **Truncated ID**: Verify the entire string was copied without missing characters.

#### Why is my Home Connect appliance unresponsive in Homebridge but working in the Home Connect app?

<!-- INCLUDES: issue-71-a9f3 -->
The Home Connect mobile app primarily communicates with appliances via the local Wi-Fi network when your phone is on the same network. In contrast, this plugin must use the public Home Connect cloud API. It is possible for an appliance to have a working local connection but a stalled cloud connection.

To diagnose this, disable Wi-Fi on your mobile device to force the Home Connect app to use a cellular (remote) connection. If the appliance becomes unresponsive, the issue lies with the appliance's connection to the Home Connect servers.

You can often resolve this by navigating to the **Settings** for the specific appliance in the official app and toggling the **Connection to server** setting off and then back on to force a reconnection to the cloud API.

#### Why do appliance status updates stop appearing in HomeKit while the plugin is still connected?

<!-- INCLUDES: issue-74-d6d6 -->
The plugin relies on a long-lived HTTP event stream from the Home Connect API. While the plugin will automatically re-establish the stream if it detects a timeout (logged as `ESOCKETTIMEDOUT`), the connection may sometimes remain technically active while the backend stops sending actual state change events.

If updates stop but no errors appear in the logs:
1. Check if the official Home Connect app is still receiving real-time updates. The app often establishes a fresh connection upon opening, which may mask a stream failure affecting the plugin.
2. Restart Homebridge to force a new event stream subscription.
3. Verify your network configuration to ensure that your router or firewall is not prematurely terminating long-lived TCP connections.

#### Why do my Home Connect appliances remain visible in the Home app when they are turned off or offline?

<!-- INCLUDES: issue-52-2dc8 -->
It is normal for appliances to remain visible in HomeKit as long as they are registered to your Home Connect account. The plugin synchronises accessories based on the list of appliances provided by the API; being unreachable by the servers does not trigger the removal of the accessory.

If you observe inconsistent behaviour, such as devices unexpectedly appearing or disappearing, it may indicate a synchronisation issue within HomeKit or Homebridge. This can usually be resolved by removing the Homebridge bridge from the Home app, clearing the Homebridge cache files, and re-adding the bridge.

#### Why does the Elgato Eve app show my appliance as inactive or having an error?

<!-- INCLUDES: issue-6-5287 -->
The **Eve** app uses the `Status Active` characteristic as a health indicator. When this value is `false`, Eve displays a warning triangle or an "inactive" message, even if there is no actual fault. 

The plugin maps Home Connect states to HomeKit to minimise these warnings. Currently, only the following states trigger the **Inactive** warning in Eve:
* `Pause`: The program has been suspended.
* `ActionRequired`: Manual intervention is needed (e.g. closing a door).
* `Error`: A functional error has occurred.
* `Aborting`: The program is being cancelled.

Idle states like `Ready` or `Finished` are mapped to `Status Active = true` specifically to prevent Eve from showing an error state when the appliance is simply waiting to be used.

#### Why is the Pause/Resume support inconsistent between my appliances?

<!-- INCLUDES: issue-8-5b9e -->
Support for the `PauseProgram` and `ResumeProgram` commands varies significantly between different appliance types and firmware versions, and often deviates from the official Home Connect API documentation. Many appliances (including some dishwashers and ovens) do not support these commands via the public API despite documentation claims.

The plugin (v0.19.0 and later) dynamically detects available commands for each appliance and only exposes supported functions. If the options are missing, your specific hardware or firmware likely does not support the feature via the Home Connect API.

#### Why is the `HeaterCooler` service not used for fridge or freezer temperature control?

<!-- INCLUDES: issue-58-06c5 -->
The HomeKit `HeaterCooler` service is designed for environmental climate control. Using it for appliances like fridges or freezers causes issues with Siri semantics: 

1. Siri would include the fridge temperature when calculating the average room temperature.
2. Commands to adjust the room temperature might inadvertently affect the fridge if they are assigned to the same HomeKit room.
3. The mode functionality does not have a consistent mapping for appliance-specific modes like Sabbath or Super-Cooling.

To preserve the integrity of voice control, this plugin exposes fridge and freezer modes as individual `Switch` services instead.

#### Why does my appliance not show ambient light colour controls in HomeKit?

<!-- INCLUDES: issue-54-f83f -->
This typically occurs if the Home Connect API fails to report colour support during discovery. Many appliances only expose the `BSH.Common.Setting.AmbientLightColor` setting when the light is actively switched on. While the plugin attempts to briefly enable the light during discovery, this can fail if the appliance was recently controlled manually or due to network delays.

To force a re-detection:
1. Ensure you are on the latest plugin version (a fix for this was included in `v0.23.2`).
2. Stop Homebridge.
3. Delete the cache file for the appliance in the plugin's persistent storage directory (`~/.homebridge/homebridge-homeconnect/persist`).
4. Ensure the appliance is in standby and not being used manually.
5. Restart Homebridge.

#### Why do I see `getaddrinfo EAI_AGAIN api.home-connect.com` in my logs?

<!-- INCLUDES: issue-50-0475 -->
This error signifies a temporary failure in DNS resolution, meaning your Homebridge host could not look up the IP address for the Home Connect servers. This is usually caused by transient internet loss, a local router reboot, or network congestion. The plugin will automatically attempt to reconnect once the network is restored. If this happens consistently, check for scheduled tasks in your local network infrastructure.

#### Why do I get an `npm ERR! ENOTEMPTY` error when installing or updating the plugin?

<!-- INCLUDES: issue-53-9275 -->
This is an `npm` package manager error rather than a fault within the plugin. It occurs when `npm` fails to rename or remove a directory because a file is being held open by another process. To resolve this: stop the Homebridge service, manually delete the temporary directory identified in the error log (e.g. `.homebridge-homeconnect-XXXXXXXX`), and attempt the installation again.

#### Why can't I set the alarm timer or `AlarmClock` setting on my appliance?

<!-- INCLUDES: issue-77-7f97 -->
HomeKit does not currently define services with the correct semantics for a general-purpose appliance alarm timer. Mapping this to unrelated HomeKit services would result in incorrect behaviour and issues with Siri. To maintain consistency and reliable voice control, the plugin does not support setting the `BSH.Common.Setting.AlarmClock` timer.

#### What does the log message `Selected program ... is not supported by the Home Connect API` mean?

<!-- INCLUDES: issue-78-c9c7 -->
This is a cosmetic warning that occurs when an appliance reports a program selection before the plugin has finished loading the list of supported programs from the API. This most commonly happens during startup or after the cache has been cleared. Once the full list is retrieved, the plugin will automatically fetch the necessary details. This message can be safely ignored if it only appears briefly.

<!-- EXCLUDED: issue-2-c470 issue-2-d759 issue-2-ee14 issue-3-b11b issue-3-e25e issue-4-f130 issue-5-7189 issue-10-f54e issue-13-d6c6 issue-17-9299 issue-21-4a0f issue-25-8397 issue-32-3eeb issue-33-f0df issue-36-116c issue-37-b6a0 issue-41-6e02 issue-43-3166 issue-47-127f issue-65-324a issue-67-1639 issue-77-48d3 issue-77-ea0e issue-78-26c0 issue-80-1fb6 issue-84-bee9 issue-85-0a95 issue-89-ea9b issue-91-e7db issue-93-7521 issue-97-c838 issue-149-a6ae -->
