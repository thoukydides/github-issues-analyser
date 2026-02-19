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

<!-- PARTITION: Home Connect API and Feature Support -->

#### Why are some appliance features, programs, or options missing?

<!-- INCLUDES: issue-1-3c2c issue-3-9883 issue-17-eee1 issue-29-d8b2 issue-44-70cc issue-62-1f79 issue-67-1639 issue-75-7835 issue-76-eaa5 issue-122-9466 issue-157-61a1 issue-186-ee7e -->
The official Home Connect app and some third-party integrations use a **private API** with functionality not yet available to the public API used by this plugin. Because the plugin dynamically queries the Home Connect API to determine capabilities, it can only expose what the manufacturer allows third-party developers to access. Common reasons for missing features include:

*   **API Limitations**: Some programs (e.g. Sabbath mode) or technical details (e.g. specific temperature increments) may be excluded from the public API.
*   **State-Based Availability**: The plugin discovers programs and options during startup. This process can fail if the appliance is disconnected, busy running a cycle, or blocked (e.g. door open, remote control disabled, or low on supplies like coffee beans).
*   **Authorisation**: Some functionality requires specific API scopes. If the API returned unrecognised keys, follow the provided link in the logs to report it on GitHub to help discover undocumented features.

To manually trigger a rescan when the appliance is idle and connected, use the HomeKit **Identify** function. You can also check the [Home Connect API Documentation](https://api-docs.home-connect.com) to verify if a feature is officially supported.

#### Why does the log say a selected program is not supported for control?

<!-- INCLUDES: issue-50-fe74 -->
Some appliances support programs that the public API can **monitor** but not **control**. This typically applies to maintenance cycles (e.g. rinsing, drum cleaning, or descaling) and user-configured **Favourites** buttons on the physical machine.

The API allows the plugin to report when these programs are running, but it does not permit the plugin to start them. The plugin logs these instances when it detects a program that was not advertised as supported during initialisation. This is normal behaviour and not a fault with the plugin.

#### How can I enable specific program options like half load or extra dry?

<!-- INCLUDES: issue-138-eb88 -->
Appliance options such as `half load` or `extra dry` are not exposed as independent HomeKit switches. Instead, they must be configured as part of a specific program switch. By default, the plugin uses a `"programs": "auto"` configuration which creates one switch for every supported program using its default settings.

To use specific options, you must manually define programs in your `config.json`:
1. Use the **Identify** function or check the Homebridge logs to find the internal names for the programs and options supported by your appliance.
2. Add the desired programs to the `programs` array in your appliance configuration.
3. Include the specific options and their values (e.g. `true` for a toggle option) in the program definition.

Note that manually defining any programs disables the `auto` discovery for that appliance; you must then list all program switches you wish to appear in HomeKit.

#### Why does the Apple Home app not show the remaining time for my appliance?

<!-- INCLUDES: issue-114-0f03 -->
The plugin exposes the `Remaining Duration` characteristic for all supported appliances. However, the official Apple Home app only displays this information for specific accessory types like `Irrigation System` or `Valve` services. It does not currently show this value for washing machines, dishwashers, or ovens.

To view the remaining time, you can use third-party HomeKit applications such as **Home+** or **Controller for HomeKit**, which support displaying a wider range of standard HomeKit characteristics that Apple's own app hides.

#### Why are ambient light settings missing for my hood or dishwasher?

<!-- INCLUDES: issue-24-3f2d -->
Certain appliances, particularly hoods and dishwashers, do not expose their full ambient light capabilities via the API unless the light is currently switched on. When the plugin starts, it may only see basic on/off controls if the light is off.

Since version `v0.18.1`, the plugin performs a discovery sequence during startup where it temporarily switches the light on to read supported capabilities (such as `AmbientLightBrightness` or `AmbientLightCustomColor`) before restoring its previous state. Note that if the colour is set to `CustomColor`, brightness is often embedded within the colour value itself and cannot be controlled independently. These capabilities are cached once discovered; ensure the appliance is reachable during plugin startup to populate this cache.

#### Why is there a delay when controlling appliances via HomeKit?

<!-- INCLUDES: issue-2-64eb -->
The Home Connect API is inherently slow, typically taking 1 to 2 seconds to complete a single request. Additionally, Home Connect imposes strict rate limits, such as a maximum of 10 error-inducing requests or 5 program starts per minute. To maintain reliability and avoid account blocks, the plugin serialises multiple characteristic changes (such as turning on a light and adjusting brightness simultaneously) into sequential API calls. This results in a necessary lag between the HomeKit command and the physical response.

#### Why does my appliance door status appear stuck or not update?

<!-- INCLUDES: issue-170-3230 -->
The plugin relies on a real-time event stream from Home Connect for status updates. When a door is opened or closed, the appliance should trigger a `STATUS` event for `BSH.Common.Status.DoorState`. If these events are not generated by the appliance firmware or the cloud service, the plugin cannot update the state in HomeKit.

This can be verified by checking Homebridge logs with debug mode (`-D`) enabled. If no `DoorState` logs appear when manipulating the door, the issue resides with the Home Connect platform. Frequent polling is not a viable alternative because the Home Connect API rate limits are extremely restrictive; the plugin only polls full status during startup or after recovering from a connection outage.

#### Why does my appliance power state show as ON after it has automatically powered off?

<!-- INCLUDES: issue-181-e108 -->
This is caused by inconsistent reporting from different appliances. Some coffee makers do not send explicit `PowerState` updates, requiring the plugin to infer the power is ON when it receives an `OperationState` of `Ready` or `Run`. Conversely, some dishwashers incorrectly report a `Ready` state while they are performing an "Auto Power Off" sequence.

To mitigate this, version `v0.30.2` and later includes a **2-second blackout period** following any explicit power-off change. During this interval, the plugin ignores `OperationState` values that would otherwise trigger a power-on inference. If the power state remains incorrect, ensure you are on the latest version and check if the appliance is sending conflicting signals outside this 2-second window.

#### Why does the log show warnings about unexpected API structures or fields?

<!-- INCLUDES: issue-144-f92c issue-145-8923 issue-175-e941 -->
The plugin performs strict validation of API responses against the official Home Connect specifications to ensure data integrity. These warnings occur when physical appliances exhibit undocumented behaviours or provide metadata (such as a `displayvalue` field) not present in the official documentation.

Specific known discrepancies, such as `ActiveProgram` returning `null` or non-standard `CONNECTED` events, were addressed in version `v0.29.2`. Support for extraneous fields like `displayvalue` was added in `v0.29.3`. These warnings are generally non-critical and do not affect functionality. If you see them on the latest version, enable debug logging (specifically `Log API Bodies`) and report the output on GitHub so the schema can be updated.

#### Why does my appliance show a `409 Conflict` or initialization error?

<!-- INCLUDES: issue-155-6e9f -->
A `409 Conflict` error, specifically `SDK.Error.HomeAppliance.Connection.Initialization.Failed`, indicates that the Home Connect cloud servers cannot establish a connection with your appliance. This typically means the appliance is offline or failed to respond in time.

To troubleshoot, disable Wi-Fi on your mobile device and attempt to control the appliance via the official Home Connect app using cellular data. This forces the app to communicate via the cloud. If the official app also fails, check the appliance's network settings or the Home Connect service status. This error originates from the cloud service and cannot be resolved within the plugin code.

#### Why does the log show `Too Many Requests` and a long wait time?

<!-- INCLUDES: issue-39-aa6b -->
The Home Connect API enforces a quota of **1000 requests per day**. Exceeding this limit results in a `429 Too Many Requests` error and a lockout period of up to 24 hours. Common causes include frequent disconnections (forcing re-syncs), heavy automation usage, or the high number of requests required during initial setup of many appliances.

The plugin automatically handles this by waiting for the lockout period to expire (e.g. `Waiting 86234 seconds`). Once elapsed, it will resume operation automatically. If it fails to recover, restart Homebridge and check logs with debug mode enabled to identify if an unstable connection is prematurely exhausting your quota.

#### Why does my oven report `Control scope has not been authorised`?

<!-- INCLUDES: issue-30-450a -->
This error occurs when the plugin lacks the necessary permissions to control oven programs. While these permissions were previously restricted, they were opened to independent developers in March 2021. 

To resolve this, ensure you are using version `v0.20.0` or later and force a re-authorisation:
1. Stop Homebridge.
2. Delete the cached token file in the plugin's `persist` directory (e.g. `~/.homebridge/homebridge-homeconnect/persist/`).
3. Restart Homebridge.
4. Click the new authorisation link in the logs to sign in again. This ensures the plugin requests the `Control` scope now permitted for ovens.

#### Why does the plugin report no supported programs or `SDK.Error.UnsupportedSetting`?

<!-- INCLUDES: issue-27-2626 -->
These errors typically indicate backend instability or an outage with the Home Connect API. If the API fails to return mandatory data like `PowerState`, the plugin cannot initialise the accessory correctly and may report that no programs are supported.

To resolve this:
1. Check logs for `502 Proxy Error` or `SDK.Error.HomeAppliance.Connection.Initialization.Failed`.
2. Wait a few hours for the service to stabilise.
3. Stop Homebridge, delete the plugin's persistent cache files, and restart. If the error persists for universal settings, it is likely a fault with the Home Connect service itself and should be reported to their support.

<!-- PARTITION: Appliance Operation and API Behaviour -->

#### Why does my appliance turn on automatically or Homebridge startup stall?

<!-- INCLUDES: issue-19-6db6 issue-20-4547 issue-72-9eb7 -->
To learn your model's specific options, the plugin must select each program via the API. For many appliances, **program options are only reported correctly when the power is on.**

At start-up, if the plugin does not have a valid cache, it will attempt to:

1. Turn the appliance on and wait for it to be ready.
2. Iterate through all available programs to record their options.
3. Restore the appliance to its initial state.

This should only happen **once**. If it happens on every restart, it means the discovery failed to finish (e.g. due to the appliance being manually operated or missing supplies) and is being retried. If the appliance is offline and no valid cache exists, this initialisation process will stall until a connection is established.

#### Which settings are used for programs started without specific options?

<!-- INCLUDES: issue-46-2122 -->
If you start a program without custom options configured, the Home Connect server uses the **appliance defaults**. This is typically the factory default or the settings from the last time that program was run manually.

To see these default values, enable **Debug Logging** and use the **Identify** function. The plugin will output a detailed list of every default value currently reported by the API.

#### Why do my Oven programs only run for one minute?

<!-- INCLUDES: issue-55-d41a issue-70-5614 -->
This is a quirk of the Home Connect API. Unlike manual operation, any oven program started remotely **must** have a defined duration. If no duration is provided, the API uses a default value (usually 60 seconds).

To fix this, you must configure **Custom Program Switches** in the plugin settings and explicitly set a `Duration` (e.g. `3600` seconds for 1 hour). This ensures the oven remains on until you manually stop it or the timer expires.

#### Why does my appliance show as offline even though the Home Connect app works?

<!-- INCLUDES: issue-40-f8f5 issue-61-1c74 -->
The official Home Connect app can communicate with appliances via your local Wi-Fi network or the Home Connect cloud. Third-party integrations like this plugin are restricted to the official cloud API. If your appliance loses its cloud connection but remains on your local network, the official app will continue to work while the plugin reports `The appliance is offline`.

To troubleshoot:
1. Check the [Home Connect Service Status](https://www.thouky.co.uk/homeconnect.html) for known API outages.
2. In the Home Connect app, navigate to **Settings** > **Network** and verify all three connection lines (Phone to Cloud, Cloud to Appliance, Phone to Appliance) are green.
3. Test the official app with your phone's Wi-Fi disabled; if it fails to control the appliance over cellular data, the issue is with the appliance's cloud connection.
4. Power cycle the appliance and your router to refresh the connection.

Most connection issues are transient and will resolve themselves once the Home Connect cloud stabilises.

#### Why are some appliance features, like ambient lighting or ice makers, not supported?

<!-- INCLUDES: issue-42-1683 issue-94-e55f -->
Support for specific features depends entirely on whether they are exposed via the Home Connect public API. Manufacturer apps often use private API calls that are not available to third-party plugins.

* **Ambient Lighting:** This is currently only exposed via the API for hood appliances. Although some dishwashers feature physical ambient lighting, the API does not yet provide a way for the plugin to control it.
* **Ice Makers/Dispensers:** Control for the ice dispenser (`Refrigeration.Common.Setting.Dispenser.Enabled`) was added in version `v0.29.0` following an API update. If this feature is missing, ensure you are on the latest plugin version.

If a feature is missing, you can verify API support by running with debug logging enabled. If the setting is not listed in the appliance details or event stream, it is not being sent by the Home Connect servers.

#### Why does the log show incorrect status or events when the appliance is off?

<!-- INCLUDES: issue-5-4389 issue-66-f64f -->
The plugin logs and displays status information exactly as reported by the Home Connect API. If the logs indicate a program is active or showing a countdown while the appliance is physically off, the Home Connect server is out of sync with the hardware.

This can result in symptoms such as:
* Countdowns (e.g. `1858 seconds remaining`) appearing for an idle appliance.
* Unexpected `Event Program Finished` logs when an appliance (particularly certain Bosch dishwashers) reconnects to the cloud.

You can often resolve this by starting and then stopping a manual program via the official app to reset the server state. If the issue persists, it may require re-registering your **Client ID**, as the plugin cannot correct invalid data sent by the API.

#### Why is my log filling up with oven temperature messages?

<!-- INCLUDES: issue-64-694f -->
Most ovens remain in a standby state where they continue to monitor and report internal temperature changes to the cloud, especially as they cool down. These generate `Event STATUS` messages in the plugin logs.

Factors affecting log frequency:
* **Temperature units:** Fahrenheit (`°F`) settings report changes almost twice as frequently as Celsius (`°C`) due to the higher sensitivity of the scale.
* **Environmental factors:** Frequent fluctuations caused by the oven door being left open.

The plugin logs all information reported by the API. To prevent these messages from cluttering your primary logs, it is recommended to run the plugin in a separate Homebridge child bridge. This isolates the high-volume events without affecting other accessories.

#### Why does my washer or dryer always show as ON in the Home app?

<!-- INCLUDES: issue-72-52a3 -->
Many washing machines and dryers are designed as always-on devices from the perspective of the Home Connect API, where the `PowerState` only supports the value `On`. The plugin handles this by mapping the network connection status to the HomeKit Power switch:

1. **On:** The appliance is connected to the Home Connect servers.
2. **Off:** The appliance is physically switched off or has lost its Wi-Fi connection (`DISCONNECTED` event).

Version `v0.23.6` improved the synchronisation of this state during startup. If your appliance is offline when Homebridge starts, the plugin may take a few moments to correctly reflect the connection status reported by the discovery list.

#### Why am I seeing `Home Connect subsystem not available` or `503` errors?

<!-- INCLUDES: issue-73-03ca -->
The error `Home Connect API error: Home Connect subsystem not available. [503]` indicates a server-side issue with the Home Connect infrastructure. This is not a fault with the plugin or your local configuration.

These issues are typically transient and are usually resolved by the Home Connect team within a few hours. Re-generating Client IDs or re-authenticating will not resolve a 503 error while the servers are down. You should check the official Home Connect system status or wait for the service to stabilise.

#### Why does the authorisation fail with `invalid_request` or `rejected` errors?

<!-- INCLUDES: issue-82-05c8 issue-86-3b75 -->
These errors occur when an authorisation request uses invalid credentials or malformed parameters. Check the following:

1. **Client ID Format:** Ensure your `clientid` is exactly 64 hexadecimal characters. Do not use the `Client Secret` or the ID associated with the `API Web Client`.
2. **Propagation Delay:** New applications in the Developer Portal can take up to an hour to propagate to the production servers. If your ID is correct, wait a short while and try again.
3. **Application Type:** Ensure you have created a new application in the developer portal for physical appliances. The default "API Web Client" credentials are often restricted to the appliance simulator.

#### Why can I see the power status of my appliance but not control it?

<!-- INCLUDES: issue-83-53f1 issue-99-fe79 -->
This typically occurs due to inconsistencies in the data reported by the Home Connect API for specific models or firmware versions. The plugin enables the HomeKit power switch based on the capabilities the API claims to support, but the server may then reject the actual commands.

Common causes include:
* **Invalid Constraints:** The API may incorrectly claim an appliance supports both `Off` and `Standby`. In this case, the plugin logs a warning and treats the power state as read-only to avoid sending invalid commands.
* **Restricted Control:** Some appliances (e.g. hobs or cooling appliances) may report power control as supported, but the API rejects changes with `SDK.Error.InvalidSettingState` for safety or hardware reasons.

This is a limitation of the API implementation for specific hardware. Control functionality may resume automatically if the manufacturer updates the device constraints for your model.

#### Home Connect API and Feature Support

<!-- PARTITION -->

#### Why are some appliance features, programs, or options missing?

<!-- INCLUDES: issue-1-3c2c issue-3-9883 issue-17-eee1 issue-29-d8b2 issue-44-70cc issue-62-1f79 issue-67-1639 issue-75-7835 issue-76-eaa5 issue-122-9466 issue-157-61a1 issue-186-ee7e -->
The official Home Connect app and some third-party integrations use a **private API** with functionality not yet available to the public API used by this plugin. Because the plugin dynamically queries the Home Connect API to determine capabilities, it can only expose what the manufacturer allows third-party developers to access. Common reasons for missing features include:

*   **API Limitations**: Some programs (e.g. Sabbath mode) or technical details (e.g. specific temperature increments) may be excluded from the public API.
*   **State-Based Availability**: The plugin discovers programs and options during startup. This process can fail if the appliance is disconnected, busy running a cycle, or blocked (e.g. door open, remote control disabled, or low on supplies like coffee beans).
*   **Authorisation**: Some functionality requires specific API scopes. If the API returned unrecognised keys, follow the provided link in the logs to report it on GitHub to help discover undocumented features.

To manually trigger a rescan when the appliance is idle and connected, use the HomeKit **Identify** function. You can also check the [Home Connect API Documentation](https://api-docs.home-connect.com) to verify if a feature is officially supported.

#### Why does the log say a selected program is not supported for control?

<!-- INCLUDES: issue-50-fe74 -->
Some appliances support programs that the public API can **monitor** but not **control**. This typically applies to maintenance cycles (e.g. rinsing, drum cleaning, or descaling) and user-configured **Favourites** buttons on the physical machine.

The API allows the plugin to report when these programs are running, but it does not permit the plugin to start them. The plugin logs these instances when it detects a program that was not advertised as supported during initialisation. This is normal behaviour and not a fault with the plugin.

#### How can I enable specific program options like half load or extra dry?

<!-- INCLUDES: issue-138-eb88 -->
Appliance options such as `half load` or `extra dry` are not exposed as independent HomeKit switches. Instead, they must be configured as part of a specific program switch. By default, the plugin uses a `"programs": "auto"` configuration which creates one switch for every supported program using its default settings.

To use specific options, you must manually define programs in your `config.json`:
1. Use the **Identify** function or check the Homebridge logs to find the internal names for the programs and options supported by your appliance.
2. Add the desired programs to the `programs` array in your appliance configuration.
3. Include the specific options and their values (e.g. `true` for a toggle option) in the program definition.

Note that manually defining any programs disables the `auto` discovery for that appliance; you must then list all program switches you wish to appear in HomeKit.

#### Why does the Apple Home app not show the remaining time for my appliance?

<!-- INCLUDES: issue-114-0f03 -->
The plugin exposes the `Remaining Duration` characteristic for all supported appliances. However, the official Apple Home app only displays this information for specific accessory types like `Irrigation System` or `Valve` services. It does not currently show this value for washing machines, dishwashers, or ovens.

To view the remaining time, you can use third-party HomeKit applications such as **Home+** or **Controller for HomeKit**, which support displaying a wider range of standard HomeKit characteristics that Apple's own app hides.

#### Why are ambient light settings missing for my hood or dishwasher?

<!-- INCLUDES: issue-24-3f2d -->
Certain appliances, particularly hoods and dishwashers, do not expose their full ambient light capabilities via the API unless the light is currently switched on. When the plugin starts, it may only see basic on/off controls if the light is off.

Since version `v0.18.1`, the plugin performs a discovery sequence during startup where it temporarily switches the light on to read supported capabilities (such as `AmbientLightBrightness` or `AmbientLightCustomColor`) before restoring its previous state. Note that if the colour is set to `CustomColor`, brightness is often embedded within the colour value itself and cannot be controlled independently. These capabilities are cached once discovered; ensure the appliance is reachable during plugin startup to populate this cache.

#### Why is there a delay when controlling appliances via HomeKit?

<!-- INCLUDES: issue-2-64eb -->
The Home Connect API is inherently slow, typically taking 1 to 2 seconds to complete a single request. Additionally, Home Connect imposes strict rate limits, such as a maximum of 10 error-inducing requests or 5 program starts per minute. To maintain reliability and avoid account blocks, the plugin serialises multiple characteristic changes (such as turning on a light and adjusting brightness simultaneously) into sequential API calls. This results in a necessary lag between the HomeKit command and the physical response.

#### Why does my appliance door status appear stuck or not update?

<!-- INCLUDES: issue-170-3230 -->
The plugin relies on a real-time event stream from Home Connect for status updates. When a door is opened or closed, the appliance should trigger a `STATUS` event for `BSH.Common.Status.DoorState`. If these events are not generated by the appliance firmware or the cloud service, the plugin cannot update the state in HomeKit.

This can be verified by checking Homebridge logs with debug mode (`-D`) enabled. If no `DoorState` logs appear when manipulating the door, the issue resides with the Home Connect platform. Frequent polling is not a viable alternative because the Home Connect API rate limits are extremely restrictive; the plugin only polls full status during startup or after recovering from a connection outage.

#### Why does my appliance power state show as ON after it has automatically powered off?

<!-- INCLUDES: issue-181-e108 -->
This is caused by inconsistent reporting from different appliances. Some coffee makers do not send explicit `PowerState` updates, requiring the plugin to infer the power is ON when it receives an `OperationState` of `Ready` or `Run`. Conversely, some dishwashers incorrectly report a `Ready` state while they are performing an "Auto Power Off" sequence.

To mitigate this, version `v0.30.2` and later includes a **2-second blackout period** following any explicit power-off change. During this interval, the plugin ignores `OperationState` values that would otherwise trigger a power-on inference. If the power state remains incorrect, ensure you are on the latest version and check if the appliance is sending conflicting signals outside this 2-second window.

#### Why does the log show warnings about unexpected API structures or fields?

<!-- INCLUDES: issue-144-f92c issue-145-8923 issue-175-e941 -->
The plugin performs strict validation of API responses against the official Home Connect specifications to ensure data integrity. These warnings occur when physical appliances exhibit undocumented behaviours or provide metadata (such as a `displayvalue` field) not present in the official documentation.

Specific known discrepancies, such as `ActiveProgram` returning `null` or non-standard `CONNECTED` events, were addressed in version `v0.29.2`. Support for extraneous fields like `displayvalue` was added in `v0.29.3`. These warnings are generally non-critical and do not affect functionality. If you see them on the latest version, enable debug logging (specifically `Log API Bodies`) and report the output on GitHub so the schema can be updated.

#### Why does my appliance show a `409 Conflict` or initialization error?

<!-- INCLUDES: issue-155-6e9f -->
A `409 Conflict` error, specifically `SDK.Error.HomeAppliance.Connection.Initialization.Failed`, indicates that the Home Connect cloud servers cannot establish a connection with your appliance. This typically means the appliance is offline or failed to respond in time.

To troubleshoot, disable Wi-Fi on your mobile device and attempt to control the appliance via the official Home Connect app using cellular data. This forces the app to communicate via the cloud. If the official app also fails, check the appliance's network settings or the Home Connect service status. This error originates from the cloud service and cannot be resolved within the plugin code.

#### Why does the log show `Too Many Requests` and a long wait time?

<!-- INCLUDES: issue-39-aa6b -->
The Home Connect API enforces a quota of **1000 requests per day**. Exceeding this limit results in a `429 Too Many Requests` error and a lockout period of up to 24 hours. Common causes include frequent disconnections (forcing re-syncs), heavy automation usage, or the high number of requests required during initial setup of many appliances.

The plugin automatically handles this by waiting for the lockout period to expire (e.g. `Waiting 86234 seconds`). Once elapsed, it will resume operation automatically. If it fails to recover, restart Homebridge and check logs with debug mode enabled to identify if an unstable connection is prematurely exhausting your quota.

#### Why does my oven report `Control scope has not been authorised`?

<!-- INCLUDES: issue-30-450a -->
This error occurs when the plugin lacks the necessary permissions to control oven programs. While these permissions were previously restricted, they were opened to independent developers in March 2021. 

To resolve this, ensure you are using version `v0.20.0` or later and force a re-authorisation:
1. Stop Homebridge.
2. Delete the cached token file in the plugin's `persist` directory (e.g. `~/.homebridge/homebridge-homeconnect/persist/`).
3. Restart Homebridge.
4. Click the new authorisation link in the logs to sign in again. This ensures the plugin requests the `Control` scope now permitted for ovens.

#### Why does the plugin report no supported programs or `SDK.Error.UnsupportedSetting`?

<!-- INCLUDES: issue-27-2626 -->
These errors typically indicate backend instability or an outage with the Home Connect API. If the API fails to return mandatory data like `PowerState`, the plugin cannot initialise the accessory correctly and may report that no programs are supported.

To resolve this:
1. Check logs for `502 Proxy Error` or `SDK.Error.HomeAppliance.Connection.Initialization.Failed`.
2. Wait a few hours for the service to stabilise.
3. Stop Homebridge, delete the plugin's persistent cache files, and restart. If the error persists for universal settings, it is likely a fault with the Home Connect service itself and should be reported to their support.

#### Appliance Operation and API Behaviour

<!-- PARTITION -->

#### Why does my appliance turn on automatically or Homebridge startup stall?

<!-- INCLUDES: issue-19-6db6 issue-20-4547 issue-72-9eb7 -->
To learn your model's specific options, the plugin must select each program via the API. For many appliances, **program options are only reported correctly when the power is on.**

At start-up, if the plugin does not have a valid cache, it will attempt to:

1. Turn the appliance on and wait for it to be ready.
2. Iterate through all available programs to record their options.
3. Restore the appliance to its initial state.

This should only happen **once**. If it happens on every restart, it means the discovery failed to finish (e.g. due to the appliance being manually operated or missing supplies) and is being retried. If the appliance is offline and no valid cache exists, this initialisation process will stall until a connection is established.

#### Which settings are used for programs started without specific options?

<!-- INCLUDES: issue-46-2122 -->
If you start a program without custom options configured, the Home Connect server uses the **appliance defaults**. This is typically the factory default or the settings from the last time that program was run manually.

To see these default values, enable **Debug Logging** and use the **Identify** function. The plugin will output a detailed list of every default value currently reported by the API.

#### Why do my Oven programs only run for one minute?

<!-- INCLUDES: issue-55-d41a issue-70-5614 -->
This is a quirk of the Home Connect API. Unlike manual operation, any oven program started remotely **must** have a defined duration. If no duration is provided, the API uses a default value (usually 60 seconds).

To fix this, you must configure **Custom Program Switches** in the plugin settings and explicitly set a `Duration` (e.g. `3600` seconds for 1 hour). This ensures the oven remains on until you manually stop it or the timer expires.

#### Why does my appliance show as offline even though the Home Connect app works?

<!-- INCLUDES: issue-40-f8f5 issue-61-1c74 -->
The official Home Connect app can communicate with appliances via your local Wi-Fi network or the Home Connect cloud. Third-party integrations like this plugin are restricted to the official cloud API. If your appliance loses its cloud connection but remains on your local network, the official app will continue to work while the plugin reports `The appliance is offline`.

To troubleshoot:
1. Check the [Home Connect Service Status](https://www.thouky.co.uk/homeconnect.html) for known API outages.
2. In the Home Connect app, navigate to **Settings** > **Network** and verify all three connection lines (Phone to Cloud, Cloud to Appliance, Phone to Appliance) are green.
3. Test the official app with your phone's Wi-Fi disabled; if it fails to control the appliance over cellular data, the issue is with the appliance's cloud connection.
4. Power cycle the appliance and your router to refresh the connection.

Most connection issues are transient and will resolve themselves once the Home Connect cloud stabilises.

#### Why are some appliance features, like ambient lighting or ice makers, not supported?

<!-- INCLUDES: issue-42-1683 issue-94-e55f -->
Support for specific features depends entirely on whether they are exposed via the Home Connect public API. Manufacturer apps often use private API calls that are not available to third-party plugins.

* **Ambient Lighting:** This is currently only exposed via the API for hood appliances. Although some dishwashers feature physical ambient lighting, the API does not yet provide a way for the plugin to control it.
* **Ice Makers/Dispensers:** Control for the ice dispenser (`Refrigeration.Common.Setting.Dispenser.Enabled`) was added in version `v0.29.0` following an API update. If this feature is missing, ensure you are on the latest plugin version.

If a feature is missing, you can verify API support by running with debug logging enabled. If the setting is not listed in the appliance details or event stream, it is not being sent by the Home Connect servers.

#### Why does the log show incorrect status or events when the appliance is off?

<!-- INCLUDES: issue-5-4389 issue-66-f64f -->
The plugin logs and displays status information exactly as reported by the Home Connect API. If the logs indicate a program is active or showing a countdown while the appliance is physically off, the Home Connect server is out of sync with the hardware.

This can result in symptoms such as:
* Countdowns (e.g. `1858 seconds remaining`) appearing for an idle appliance.
* Unexpected `Event Program Finished` logs when an appliance (particularly certain Bosch dishwashers) reconnects to the cloud.

You can often resolve this by starting and then stopping a manual program via the official app to reset the server state. If the issue persists, it may require re-registering your **Client ID**, as the plugin cannot correct invalid data sent by the API.

#### Why is my log filling up with oven temperature messages?

<!-- INCLUDES: issue-64-694f -->
Most ovens remain in a standby state where they continue to monitor and report internal temperature changes to the cloud, especially as they cool down. These generate `Event STATUS` messages in the plugin logs.

Factors affecting log frequency:
* **Temperature units:** Fahrenheit (`°F`) settings report changes almost twice as frequently as Celsius (`°C`) due to the higher sensitivity of the scale.
* **Environmental factors:** Frequent fluctuations caused by the oven door being left open.

The plugin logs all information reported by the API. To prevent these messages from cluttering your primary logs, it is recommended to run the plugin in a separate Homebridge child bridge. This isolates the high-volume events without affecting other accessories.

#### Why does my washer or dryer always show as ON in the Home app?

<!-- INCLUDES: issue-72-52a3 -->
Many washing machines and dryers are designed as always-on devices from the perspective of the Home Connect API, where the `PowerState` only supports the value `On`. The plugin handles this by mapping the network connection status to the HomeKit Power switch:

1. **On:** The appliance is connected to the Home Connect servers.
2. **Off:** The appliance is physically switched off or has lost its Wi-Fi connection (`DISCONNECTED` event).

Version `v0.23.6` improved the synchronisation of this state during startup. If your appliance is offline when Homebridge starts, the plugin may take a few moments to correctly reflect the connection status reported by the discovery list.

#### Why am I seeing `Home Connect subsystem not available` or `503` errors?

<!-- INCLUDES: issue-73-03ca -->
The error `Home Connect API error: Home Connect subsystem not available. [503]` indicates a server-side issue with the Home Connect infrastructure. This is not a fault with the plugin or your local configuration.

These issues are typically transient and are usually resolved by the Home Connect team within a few hours. Re-generating Client IDs or re-authenticating will not resolve a 503 error while the servers are down. You should check the official Home Connect system status or wait for the service to stabilise.

#### Why does the authorisation fail with `invalid_request` or `rejected` errors?

<!-- INCLUDES: issue-82-05c8 issue-86-3b75 -->
These errors occur when an authorisation request uses invalid credentials or malformed parameters. Check the following:

1. **Client ID Format:** Ensure your `clientid` is exactly 64 hexadecimal characters. Do not use the `Client Secret` or the ID associated with the `API Web Client`.
2. **Propagation Delay:** New applications in the Developer Portal can take up to an hour to propagate to the production servers. If your ID is correct, wait a short while and try again.
3. **Application Type:** Ensure you have created a new application in the developer portal for physical appliances. The default "API Web Client" credentials are often restricted to the appliance simulator.

#### Why can I see the power status of my appliance but not control it?

<!-- INCLUDES: issue-83-53f1 issue-99-fe79 -->
This typically occurs due to inconsistencies in the data reported by the Home Connect API for specific models or firmware versions. The plugin enables the HomeKit power switch based on the capabilities the API claims to support, but the server may then reject the actual commands.

Common causes include:
* **Invalid Constraints:** The API may incorrectly claim an appliance supports both `Off` and `Standby`. In this case, the plugin logs a warning and treats the power state as read-only to avoid sending invalid commands.
* **Restricted Control:** Some appliances (e.g. hobs or cooling appliances) may report power control as supported, but the API rejects changes with `SDK.Error.InvalidSettingState` for safety or hardware reasons.

This is a limitation of the API implementation for specific hardware. Control functionality may resume automatically if the manufacturer updates the device constraints for your model.

### Home Connect Errors

## HomeKit Services

### Notifications and Events

<!-- PARTITION -->

#### Why does my appliance appear as `Stateless Programmable Switch` buttons?

<!-- INCLUDES: issue-1-38d2 issue-3-c53c issue-31-241e issue-43-caee issue-45-fb59 issue-153-91f4 -->
Home Connect communicates many appliance states as **transient events** (such as "Drip tray full", "Cooktop timer ended", or "iDos fill level poor") rather than persistent, queryable states. It is not possible for the plugin to poll the current state (for example, after a reboot), and many appliances do not reliably generate events when a condition clears.

These events map to `Stateless Programmable Switch` services, allowing them to be used as automation triggers. The Apple Home app only displays numeric labels (Button 1, Button 2, etc.). For dishwashers, these typically represent:
1. **Program Finished**
2. **Program Aborted**
3. **Salt Low**
4. **Rinse Aid Low**

To identify what these buttons represent for other appliances, check your **Homebridge logs** during startup or use a third-party app like **Eve** or **Home+** which displays the descriptive labels. If you do not require these triggers, you can disable them globally or per-appliance in the plugin configuration.

#### Why does the Home app show separate tiles for one appliance?

<!-- INCLUDES: issue-59-593e -->
This is standard Apple Home behaviour. To keep the interface organised, Apple separates different service types into distinct tiles. Specifically, a separate tile is created for the `Stateless Programmable Switch` services used for event triggers.

While you can toggle **Show as Separate Tiles** in the accessory settings, Apple does not currently allow these buttons to be merged into the primary appliance tile. If you do not use these events for automations, you can disable them in the plugin configuration to prevent them from appearing in the Home app.

#### How can I manage or receive appliance notifications?

<!-- INCLUDES: issue-38-9780 issue-63-11e1 issue-132-791b -->
Apple Home only supports native push notifications for specific security-related sensors (Doors, Locks, Smoke, etc.). Most Home Connect events do not fit these categories; forcing them to do so would result in misleading notification text.

To receive notifications for other events, you have two main options:
* **The Official Home Connect App:** The most reliable way to get detailed, text-based push notifications.
* **HomeKit Automations:** Trigger an action via a `Stateless Programmable Switch`. You can generate a HomeKit notification indirectly by having the automation toggle a [homebridge-dummy](https://github.com/mpatfield/homebridge-dummy) Contact Sensor, which *does* support native alerts.

To **disable** door notifications specifically, you can adjust the **Activity Notifications** settings for the door accessory within the Apple **Home** app. Alternatively, since `v0.32.0`, you can use per-appliance configuration options to remove the `Door` service entirely if you do not require its state in HomeKit.

#### Why does my Siemens coffee maker stay On in HomeKit after entering auto-standby?

<!-- INCLUDES: issue-35-2eee -->
Certain coffee makers, particularly Siemens TI95 series models, do not reliably emit a `PowerState` change event through the Home Connect API when transitioning to standby mode automatically. This results in the HomeKit power switch remaining **On** even though the appliance is inactive.

The plugin includes a workaround (implemented in `v0.18.3`) that monitors `BSH.Common.Status.OperationState`. When the appliance reports it has become `Inactive`, the plugin infers the power has been switched off or moved to standby. If you encounter this, ensure you are running the latest version of the plugin and have not disabled status updates in your configuration. Note that the plugin treats both `Off` and `Standby` as **Off** in HomeKit.

#### Why can't I see the remaining programme time in the Home app?

<!-- INCLUDES: issue-48-237c -->
The remaining duration is exposed via the `RemainingTime` characteristic on the main `Active Program` switch service, but there are limitations on visibility:

1. Apple's Home app generally only displays the `Remaining Duration` characteristic for specific accessory types defined in the HomeKit Accessory Protocol (HAP), such as `Irrigation System` and `Valve`. As appliances do not fall into these categories, the value is hidden in the native Home app.
2. To view the remaining time or use it for automations, you must use a third-party HomeKit app such as **Controller for HomeKit** or **Eve** which supports displaying non-standard characteristics for appliance services.

#### How can I simplify the list of program switches or change their order?

<!-- INCLUDES: issue-7-36fe issue-49-3c91 -->
By default, the plugin creates individual switches for every supported programme. For devices like washers or dryers, this can clutter the HomeKit interface. To hide these, enable the **No individual program switches** option in the plugin configuration; this maintains core functionality while removing the extra cycle switches.

Regarding the display order, the HomeKit Accessory Protocol (HAP) does not provide a robust way for plugins to enforce the order of services. Individual HomeKit apps determine how to order tiles and switches. Most third-party apps, such as **Eve** or **Home+**, allow users to manually reorder services or characteristics within their own interfaces if you require a specific layout.

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

### New partition 1

<!-- PARTITION: New partition 1 -->

#### 🚧 How can I find the `haID` (Home Appliance ID) for my appliance? 🚧

<!-- INCLUDES: issue-1-2779 -->
The `haID` is a unique identifier required for customising appliance configurations in `config.json`. You can find this value in several ways: 1. In HomeKit apps, it is displayed as the appliance's **Serial Number**. 2. By using the **Identify** function on the accessory within your HomeKit app, which will write the full appliance details (including the `haID`) to the Homebridge log. 3. When debug mode is enabled (`DEBUG=*`), the `haID` is included in almost all log entries and Home Connect request URLs. The format typically follows a pattern like `MANUFACTURER-MODEL-HEXADECIMAL_ID`.

#### 🚧 Why does the Eve app show my appliance as 'Inactive' when it is idle? 🚧

<!-- INCLUDES: issue-1-96fa -->
When an appliance is switched on but not currently running a program, its state is logically **Inactive**. The Eve app specifically chooses to highlight this status in a way that can appear like a warning or an error. This is a user interface decision made by the Eve app developers; other HomeKit applications do not typically treat the idle state as a negative status.

#### 🚧 Why am I seeing `SDK.Error.HomeAppliance.Connection.Initialization.Failed` in my logs? 🚧

<!-- INCLUDES: issue-1-e985 -->
This error typically indicates a communication failure between your physical appliance and the **Home Connect cloud servers**. It is not caused by the plugin itself. If you encounter this, check the network status section in the official Home Connect app on your mobile device to ensure the appliance has a stable internet connection.

#### 🚧 Why do all services for my appliance have the same name in the Home app since updating to iOS 16? 🚧

<!-- INCLUDES: issue-108-a5c4 -->
iOS 16 introduced changes to how the Home app displays names for accessories containing multiple services. In many cases, it defaults to showing the name of the parent accessory rather than the unique name of the individual service (such as specific buttons or sensors on a dishwasher). The plugin was updated in version 0.27.0 to include mitigations for this behaviour, such as better support for the `Configured Name` characteristic. To resolve this: 

1. Ensure you are running version 0.27.0 or later of the plugin.
2. If names do not update automatically, you may need to manually rename the individual services within the Home app to restore your preferred labels.

#### 🚧 Why does my appliance occasionally show as not available or return `SDK.Error.504.GatewayTimeout`? 🚧

<!-- INCLUDES: issue-11-d4f5 -->
The `SDK.Error.504.GatewayTimeout` error message indicates that the Home Connect cloud servers are experiencing internal issues or high latency. This is a server-side problem with the Home Connect API infrastructure and is not caused by the plugin. Users may observe that an appliance remains responsive within the official Home Connect mobile app while failing via HomeKit, as the app and the public API can use different communication paths or experience different levels of load. If these errors occur frequently, it usually indicates transient instability in the Home Connect service.

#### 🚧 Why does the power button for my oven not work? 🚧

<!-- INCLUDES: issue-112-6c3a -->
Failure to power an oven on or off is frequently attributed to a bug in the Home Connect API. This is a known issue affecting specific appliance models where the power commands are either ignored or rejected by the Home Connect servers. If you experience this behaviour, please report it directly to [Home Connect Developer Support](https://developer.home-connect.com/support/contact). Include your appliance's part number (E-Nr) and details of the failure. This is an external platform limitation that cannot be resolved through plugin updates.

#### 🚧 Why do I see the error `HomeAppliance connection initialization failed [SDK.Error.HomeAppliance.Connection.Initialization.Failed]`? 🚧

<!-- INCLUDES: issue-113-d74c -->
This error is returned by the Home Connect API and indicates that the cloud servers were unable to communicate with your appliance. It is not an authentication issue and cannot be resolved by regenerating tokens or re-authorising the plugin.

According to the Home Connect API documentation, this error occurs when:
1. The appliance is offline or powered down.
2. The appliance failed to respond to connection requests within the required timeout.
3. There are transient connectivity issues between the appliance, your local network, and the Home Connect servers.

This behaviour is frequently caused by flaky Home Connect server infrastructure or local Wi-Fi instability. If you encounter this error, verify if the appliance is controllable via the official Home Connect mobile app. Often, the issue is temporary and will resolve itself without intervention.

#### 🚧 Why am I getting the error `client has limited user list - user not assigned to client [invalid_client]`? 🚧

<!-- INCLUDES: issue-115-c713 -->
This error is returned by the Home Connect API servers and indicates that the account you are using to log in is not authorised to use the specific Developer Application you created. This is usually caused by a configuration mismatch in the Home Connect Developer Portal.

To resolve this, verify the following settings on the [Home Connect Developer Portal](https://developer.home-connect.com/):

1. Check the **Home Connect User Account for Testing** field within your application settings. This must exactly match the email address used for your Home Connect mobile app.
2. Verify the **Default Home Connect User Account for Testing** in your developer profile settings.
3. If you have recently migrated your account to **SingleKey ID**, ensure that your developer profile and application settings have been updated to reflect the correct email address.

If the configuration is correct but the error persists or reappears after a short period of working, it may indicate a server-side issue with your specific account. In such cases, you should contact [Home Connect Developer Support](https://developer.home-connect.com/support/contact) directly, as this cannot be resolved within the plugin.

#### 🚧 Why do my appliance program switches show up with generic names in the Apple Home app? 🚧

<!-- INCLUDES: issue-116-e2ec -->
Starting with iOS 16, the Apple Home app changed how it handles service names, often ignoring the custom names provided by plugins and displaying the generic accessory name instead. 

To address this, the plugin (from version 0.27.0 onwards) includes the `Configured Name` characteristic for `Switch`, `Stateless Programmable Switch`, and `Lightbulb` services. This characteristic allows the Home app to display the correct program names (e.g. `Cappuccino`, `Espresso`) for most tiles. 

If you are still seeing generic names:
1. Ensure the plugin is updated to at least v0.27.0.
2. Note that `Stateless Programmable Switch` services (used for some button-like controls) may still appear as numeric buttons in the Apple Home app due to iOS-specific limitations. Third-party apps like **Eve** or **Home+** may display these more clearly.
3. You can manually rename the switches within the Home app settings for that specific accessory to restore your preferred naming convention.

#### 🚧 What does the error `BSH.Common.Error.WriteRequest.Busy` mean? 🚧

<!-- INCLUDES: issue-116-1125 -->
The `BSH.Common.Error.WriteRequest.Busy` error is returned by the Home Connect cloud servers when a command is sent to an appliance that is currently unable to process it. 

This typically occurs when:
* The appliance requires physical user interaction (e.g. a coffee machine needs its drip tray emptied or water tank filled).
* The appliance is in a state where it cannot accept the specific command (e.g. attempting to start a program while a door is open or a cleaning cycle is active).
* There is a transient issue with the Home Connect cloud service itself.

If you encounter this error, check the physical display of the appliance or the official Home Connect app to see if a manual action is required.

#### 🚧 Why does the plugin fail with `request rejected by client authorization authority (developer portal)`? 🚧

<!-- INCLUDES: issue-117-1a0f -->
This error message is returned directly by the Home Connect API servers and indicates that the authorisation request was rejected before reaching the plugin. This is typically caused by a configuration mismatch between the plugin settings and the application registration in the Home Connect developer portal.

To resolve this issue, please verify the following in the [Home Connect Developer Portal](https://developer.home-connect.com/applications):

1. **Client ID**: Ensure that the `Client ID` configured in the plugin exactly matches the one shown in your developer account. A single incorrect character will cause the authorisation to fail.
2. **Success Redirect**: Ensure that a valid URL is entered in the **Success Redirect** field of your application configuration. If this field is empty or contains an invalid URI, the API will reject the request with a `400 unauthorized_client` error.

If you have confirmed both settings and the error persists, you may need to delete and recreate the application in the developer portal to reset its state.

#### 🚧 Why does SingleKey ID show a session expired error or fail to redirect during authorisation? 🚧

<!-- INCLUDES: issue-118-9a71 -->
Authorisation issues occurring after the plugin has provided the initial login URL are typically caused by the Home Connect or SingleKey ID services rather than the plugin itself. In some instances, the SingleKey ID website may fail to redirect back to the authorisation handler due to restrictive Content Security Policy (CSP) directives.

If you encounter a session expiry message or the page stalls after logging in, try the following workaround:
1. Restart the authorisation process from the plugin configuration.
2. On the SingleKey ID login screen, ensure you tick the **Stay logged in** option.
3. If the page still fails to redirect automatically after signing in, open your browser's developer tools (usually `F12` or right-click and select **Inspect**).
4. Look for the callback URL in the network logs or console and manually navigate to it to complete the process.

#### 🚧 Why do I get a `Device authorization session has expired` error during setup? 🚧

<!-- INCLUDES: issue-121-ccc6 -->
This error typically occurs when the SingleKey ID account used for authorisation is not fully configured or verified in the official mobile app. To resolve this:

1. Open the official Home Connect app on your mobile device.
2. Ensure you are logged in with the same SingleKey ID used for the Homebridge plugin.
3. Verify that your account profile is complete and any pending email verifications or terms of service acceptances have been processed.
4. Once the account is fully active and functional within the mobile app, restart the plugin and attempt the authorisation process again.

#### 🚧 Can I disable the power or active program switches for my appliance? 🚧

<!-- INCLUDES: issue-124-2e72 -->
You can control which individual program switches are provided by using the `addprograms` option in your `config.json` file. However, the `Switch` services for appliance power and the active program are fundamental to the plugin's architecture and cannot be disabled via configuration. If you wish to avoid accidental activation, consider moving these switches to a different room or a 'Technical' zone within the Home app.

#### 🚧 Why is the remaining program time or current stage not visible in the Home app? 🚧

<!-- INCLUDES: issue-124-9bb6 -->
There are two main reasons why this information may be missing:

1.  **API Limitations**: Most Home Connect appliances (except for the Roxxter cleaning robot) do not report specific program stages like 'rinsing' or 'spinning'. They only provide elapsed time, remaining time, and percentage completion.
2.  **HomeKit Display**: The plugin provides a `Remaining Program` characteristic, but the official Apple Home app does not support displaying it. To see the remaining duration, you must use a third-party HomeKit app that supports a wider range of characteristic types.

#### 🚧 How can I get notifications for program completion or low detergent levels? 🚧

<!-- INCLUDES: issue-124-8aea -->
The Apple Home app only generates native notifications for a restricted set of characteristics, primarily those related to security (such as doors). It does not support native notifications for appliance program states or consumable levels.

To receive these alerts, you can use the `Stateless Programmable Switch` services provided by the plugin for events like `Program Finished` or `i-Dos Low`. These services allow you to create HomeKit automations that can trigger custom actions or notifications when the specific event occurs.

#### 🚧 Why do I get "The code entered is invalid or has expired" when authenticating? 🚧

<!-- INCLUDES: issue-125-9208 -->
This error typically occurs during the initial OAuth authorisation process due to one of the following reasons:

1.  **Propagation Delay**: When you create or modify an application on the Home Connect Developer Portal, it can take up to 15 minutes for those changes to be synchronised across their authorisation servers. If you attempt to authenticate immediately, the request may be rejected.
2.  **Code Expiration**: The verification codes generated for the `device_verify` URL are only valid for 10 minutes. If you use an older link, it will have expired.
3.  **Stale UI Links**: If you are using the Homebridge Config UI X web interface, the verification link shown in the plugin configuration does not update automatically. You must close and re-open the configuration editor to see a fresh link. Alternatively, check the Homebridge logs, as a new URL is logged every 10 minutes until authorisation is successful.

If you continue to experience issues after waiting 15 minutes and using a fresh link from the logs, contact Home Connect support via their developer portal.

#### 🚧 Why are there no log entries for several hours even though the plugin is running? 🚧

<!-- INCLUDES: issue-13-159f -->
If no appliances are being used and no status changes are occurring, it is normal for the plugin to remain silent in the logs. By default, log entries are only generated when an appliance is controlled via HomeKit, the Home Connect event stream reports a change in appliance state, or a connection error occurs. When running with debug logging (`-D`) enabled, the plugin polls the appliance list approximately once per hour, but otherwise remains quiet unless there is activity. The absence of log updates does not indicate that the plugin or Homebridge has frozen.

#### 🚧 What does a `Proxy Error` in the logs mean? 🚧

<!-- INCLUDES: issue-13-daa9 -->
A `Proxy Error` indicates that the Home Connect API servers unexpectedly terminated the event stream. This is a server-side issue within the Home Connect infrastructure and is not caused by the plugin. The plugin is designed to handle these interruptions by automatically attempting to re-establish the connection. If these errors occur frequently, it usually indicates transient instability in the Home Connect cloud service.

#### 🚧 Why are fridge door alarms not mapped to stateful Door or Security services in HomeKit? 🚧

<!-- INCLUDES: issue-132-67f7 -->
Home Connect events, such as door alarms or temperature warnings, are essentially stateless within the API for several reasons:

* **No Polling for State**: The API provides no mechanism to query whether an event is currently active (e.g., if an alarm is 'on' or 'off') when Homebridge starts or after a loss of connectivity.
* **Inconsistent Event Clearing**: While the API reports when an event occurs (e.g., `EventPresentState.Present`), the reporting of the 'off' state is inconsistent across different appliance types and firmware versions. Many appliances simply stop sending the 'present' event rather than explicitly sending a 'cleared' event.
* **API Undocumented Behaviour**: The frequency of repeated alarm events (e.g., once per second) is not documented, making it unreliable to implement a timeout-based state system.

Because of these limitations, the plugin maps these events to `Stateless Programmable Switch` services. These can be used to trigger HomeKit automations, but they cannot reliably represent a persistent 'alarm active' state.

#### 🚧 Why am I seeing `Home Connect API error: getaddrinfo EAI_AGAIN api.home-connect.com` in my logs? 🚧

<!-- INCLUDES: issue-137-6081 -->
The error `getaddrinfo EAI_AGAIN` is a standard networking error indicating a temporary failure in DNS name resolution. This means your local system or Homebridge host is unable to resolve the IP address for the Home Connect API servers. To resolve this issue:

1. Check your local network's DNS settings and ensure your Homebridge server has a stable internet connection.
2. Verify that your DNS provider is not experiencing outages or blocking requests to `api.home-connect.com`.
3. If you are using a specific environment like HOOBS, ensure that the underlying operating system's networking stack is correctly configured, as this error typically originates from the host system rather than the plugin itself.

This is a local environment issue and cannot be resolved by changing the plugin's configuration.

#### 🚧 Why does the ice maker toggle not appear for my Home Connect fridge? 🚧

<!-- INCLUDES: issue-141-5245 -->
The ability to control an ice maker depends on the appliance exposing the `Refrigeration.FridgeFreezer.Setting.DispenserEnabled` setting via the Home Connect API. This feature was implemented in the plugin starting with version 0.29.0.

If the control is missing in HomeKit, it indicates that the appliance firmware or the specific model does not support this setting through the API. The plugin can only expose functionality that the Home Connect API explicitly provides for a connected device; it cannot control features that are only available via the physical appliance buttons or the official Home Connect app if they are not also part of the public API.

### New partition 2

<!-- PARTITION: New partition 2 -->

#### 🚧 Why does my coffee machine fail to start or show Not responding when using the switch in the Home app? 🚧

<!-- INCLUDES: issue-149-a6ae -->
Coffee machine appliances often expose multiple `Switch` services to HomeKit, including: 

* **Power**: Controls the standby state of the machine.
* **Active Program**: Starts or stops the currently selected program.
* **Custom Program**: Specifically triggers a user-defined program (e.g. Ristretto).
* **Cup Warmer**: (If supported) Controls the warming plate.

By default, the Apple Home app may group these separate services into a single tile. Toggling this combined tile attempts to activate all switches simultaneously. Because coffee machines require time to power on and initialise, attempting to start a program at the same time as the power switch will typically result in a failure or a `Not responding` status in the Home app.

To resolve this, you should configure the Home app to display these services individually:

1. Open the **Home** app and find the coffee machine accessory tile.
2. Long-press the tile and select **Accessory Details**.
3. Scroll down and select **Show as Separate Tiles**.

This allows you to power on the machine first, wait for it to reach a ready state, and then trigger the specific program switch.

#### 🚧 Why does the log show `The appliance is offline` when the device is connected in the Home Connect app? 🚧

<!-- INCLUDES: issue-15-25d9 -->
The `The appliance is offline` message indicates that the plugin has lost its connection to the Home Connect **Event Stream** or failed to synchronise the appliance's state. The plugin relies on this persistent stream for real-time updates; if it is interrupted, the appliance is flagged as offline to prevent operations based on outdated information. This status specifically refers to the API's event-based connection rather than the appliance's local Wi-Fi status. It is possible for an appliance to appear functional in the official Home Connect app (which can use alternative communication methods) while being reported as offline in Homebridge if the event stream is unavailable. Ensure your network allows persistent outgoing connections and check for any Home Connect service interruptions.

#### 🚧 Why does the Home Connect authorisation link in the settings expire or fail? 🚧

<!-- INCLUDES: issue-151-9c3a -->
The authorisation URI generated by the plugin for linking your account is subject to technical constraints from the Home Connect servers.

*   The authorisation link is only valid for **30 minutes**. You must complete the process within this window; otherwise, the link will become invalid.
*   If the link fails or has expired, refresh the plugin configuration page or restart Homebridge to generate a new URI.
*   If the link is displayed as `[object Promise]` or `https://.../[object%20Promise]`, ensure you have updated the plugin to at least `v0.29.5`. This was a display issue in earlier versions where the link generation was not correctly awaited in the user interface.

#### 🚧 Why does the plugin report `401 Unauthorized` with the error `client has limited user list - user not assigned to client`? 🚧

<!-- INCLUDES: issue-162-1a03 -->
This error is generated by the Home Connect authorisation servers and indicates that the account attempting to login (your SingleKey ID or Home Connect email) has not been correctly associated with the application created in the Home Connect Developer Portal. 

Common causes and solutions include:
1. **Configuration mismatch**: Verify that the `clientid` in your Homebridge configuration exactly matches the Client ID provided in the Home Connect Developer Portal.
2. **Account consistency**: Ensure you are attempting to authorise using the same email address registered in both the Home Connect mobile app and the Developer Portal.
3. **Propagation delay**: If you have recently created the application or changed settings in the Developer Portal, it can take up to 48 hours for these changes to synchronise across the Home Connect infrastructure. If the configuration is correct, waiting for this period often resolves the issue automatically.

#### 🚧 Why do my other Homebridge plugins show No Response after installing the Home Connect plugin? 🚧

<!-- INCLUDES: issue-164-bbc4 -->
Homebridge plugins operate in isolation, meaning the Home Connect plugin cannot directly interfere with the operation of other plugins. If multiple unrelated plugins show a `No Response` status in the Apple Home app simultaneously, this typically indicates a problem at the Homebridge process level or with the HomeKit pairing state.

To troubleshoot this behaviour:
1. Check the Homebridge logs to see if the entire process is crashing or restarting. A crash in one plugin can take down the whole bridge if they are not running in child bridges.
2. Ensure that your environment (Node.js and `npm`) is updated to the latest recommended versions for Homebridge.
3. If the issue persists, it may be due to HomeKit database inconsistencies. In some cases, removing and re-adding the Homebridge bridge to the Home app is required to restore communication.
4. For detailed diagnostics, enable debug logging by starting Homebridge with the `-D` flag and setting the `DEBUG=*` environment variable to capture HAP (HomeKit Accessory Protocol) interactions.

#### 🚧 Why do I see an `InvalidStepSize` or `SDK.Error.InvalidOptionValue` error when configuring programs? 🚧

<!-- INCLUDES: issue-18-1fff -->
The Home Connect API requires that values for certain program options, such as `FillQuantity` for coffee makers or `StartInRelative` for various appliances, must be exact multiples of a specific step size. If a value is provided that does not align with these increments, the API will return an error such as `Home Connect API error: ... validation failed with InvalidStepSize. [SDK.Error.InvalidOptionValue]`. The plugin attempts to mitigate this in the Homebridge configuration UI by providing dropdown menus for options with fewer than 20 permitted values, or by adding the required step size to the field description for larger ranges. When entering values, ensure they are multiples of the required step size. Using the up/down arrows in the Homebridge UI should typically snap the value to the correct increment.

#### 🚧 Why do I get a 409 Conflict error [SDK.Error.ProgramNotAvailable] when starting a program? 🚧

<!-- INCLUDES: issue-186-6cfd -->
A `409 Conflict` error with the code `SDK.Error.ProgramNotAvailable` occurs when you attempt to start a program that the Home Connect API currently considers unavailable for remote execution.

This typically happens because:
- The program is not supported for remote start on your specific appliance model.
- The appliance is in a state that prevents that specific program from starting (e.g. local control is active, or a required precondition is not met).
- The Home Connect API response for `available` programs does not include the program you are trying to trigger.

If the program is visible in HomeKit but fails with this error, it indicates that while the plugin knows the program exists, the API is rejecting the request to execute it. You can verify which programs are truly available by enabling the `Log API Bodies` debug option and checking the response to the `GET /api/homeappliances/.../programs/available` request in the logs.

#### 🚧 Why are some features available in IFTTT or the official app missing from the plugin? 🚧

<!-- INCLUDES: issue-188-cb08 -->
This plugin is limited by the capabilities of the public Home Connect API. Certain features, such as Dryer AutoSense (synchronising programs between a washing machine and dryer), are available to official partners like IFTTT via private API integrations but are not exposed to third-party developers. If a specific program or option (such as `dryer_select_connected_dry_program`) is not documented in the [official Home Connect API documentation](https://api-docs.home-connect.com/programs-and-options/), it cannot be supported by this plugin. If you require these features, you should contact the Home Connect team directly to request their addition to the public API.

#### 🚧 Why does the log show `Gateway Timeout` or `Proxy Error` even though the official app works? 🚧

<!-- INCLUDES: issue-19-6154 -->
These errors (`SDK.Error.504.GatewayTimeout` or `Proxy Error`) are returned directly by the Home Connect API servers and indicate instability or maintenance in their backend infrastructure. 

The public API used by third-party integrations often experiences issues independently of the official Home Connect mobile app. This is a known limitation of the service's reliability that the plugin cannot fix. The plugin is designed to automatically attempt to reconnect and resume the event stream once the Home Connect servers are responsive again. 

If you see frequent `Gateway Timeout` messages, it usually signifies that the Home Connect subsystem is timing out internally before responding to the plugin's requests.

#### 🚧 Why cannot I see the remaining time or detailed status of my dishwasher or oven in the Apple Home app? 🚧

<!-- INCLUDES: issue-2-d759 -->
Apple's official Home app has limited support for specific appliance characteristics such as `Remaining Duration` or detailed program states. While the plugin provides this data, it is not displayed in the Home app. To view these details or use them as automation triggers, you should use a third-party HomeKit app such as **Eve** or **Home+**. Additionally, the plugin provides `Stateless Programmable Switch` services that function as automation triggers for events like **Program finished**, **Timer finished**, or **Preheat finished**, which are visible in any HomeKit app.

#### 🚧 How do I control my hood fan speed using Siri? 🚧

<!-- INCLUDES: issue-2-ee14 -->
Siri maps fan speeds to specific percentages: **Low** is 25%, **Medium** is 50%, and **High** is 100%. The plugin maps these percentages to the closest available physical fan settings of your hood. You can use commands like `Hey Siri, set the hood fan to medium` or `Hey Siri, set the hood fan to 100%`. Note that numeric settings like `set fan to 1` are not supported by Siri for HomeKit fan services.

#### 🚧 Why does my multi-cavity oven show `BSH.Common.Error.InvalidUIDValue` in the logs? 🚧

<!-- INCLUDES: issue-2-c470 -->
This error typically occurs with multi-cavity appliances (such as the Thermador PRD486WDHU range) where only the main oven supports Home Connect functionality. If the Home Connect API continues to advertise the secondary oven despite it lacking remote capabilities, queries for its programs will fail with `BSH.Common.Error.InvalidUIDValue`. The plugin is designed to handle this gracefully by ignoring the error and disabling program control for the unsupported cavity. This is an issue with the Home Connect API's device enumeration which they have worked to address in their server-side updates.

#### 🚧 Why does my coffee machine power switch fail with `SDK.Error.InvalidSettingState`? 🚧

<!-- INCLUDES: issue-22-3aca -->
If you receive an error stating `BSH.Common.Setting.PowerState currently not available or writable [SDK.Error.InvalidSettingState]` when attempting to control your coffee machine (or other appliance), it typically means the appliance is in a state where it cannot process remote commands. 

This commonly occurs when:
1. A maintenance message is displayed on the physical appliance screen (e.g. "Change water filter" or "Descaling required") that requires manual confirmation.
2. The appliance is performing a critical internal process that prevents remote state changes.

Because the Home Connect API does not always provide specific details about these maintenance prompts (such as water filter status) to the plugin, the plugin cannot proactively warn you or bypass the restriction. You must resolve the prompt on the appliance's physical control panel before remote control via HomeKit can resume.

#### 🚧 Why are program switches still visible even after disabling them in the configuration? 🚧

<!-- INCLUDES: issue-25-8397 -->
If you have configured specific appliances to hide their program switches (e.g. by setting `Program Switches` to `No individual program switches`) but they still appear, this is typically caused by a mismatch in the appliance identifier (`haId`) within your `config.json`.

The plugin applies per-appliance settings by matching the `haId` exactly. To ensure your configuration is applied correctly, check the following:

* **Exact Match**: The `haId` must have matching case and punctuation.
* **No Hidden Characters**: Ensure there are no leading or trailing spaces in the identifier string.
* **Consistency**: The logic for hiding program switches is shared across all appliance types (except Hoods). If the setting works for one appliance but not another, the issue is almost certainly the identifier used in the configuration.

You can find the correct `haId` for your appliances in the Homebridge logs during plugin startup or through the Homebridge UI settings.

#### 🚧 Why is a specific appliance program or feature showing as `Not Responding` while others work? 🚧

<!-- INCLUDES: issue-26-a87b -->
This behaviour often indicates that the plugin's cached list of supported programs or features for that specific appliance has become stale or no longer matches what the Home Connect API expects. This can occur after an appliance firmware update or a change in the Home Connect server-side configuration.

### Recommended Resolution: Refresh via Identify
The simplest way to force the plugin to refresh the list of supported programs and rebuild its internal configuration schema is to use the **Identify** function within HomeKit (found in the accessory settings for the appliance). Triggering this will: 
1. Re-read all supported programs and options from the Home Connect API.
2. Output the current appliance configuration to the Homebridge logs.
3. Update the cached metadata used by the plugin.

### Alternative Resolution: Clearing Persistent Cache
If the `Identify` method does not resolve the issue, you can manually clear the plugin's cache. The plugin stores appliance-specific metadata in a `persist` directory, usually located at `~/.homebridge/homebridge-homeconnect/persist`.

To safely clear the cache:
1. Stop Homebridge.
2. Navigate to the `persist` directory mentioned above.
3. Identify the file starting with `94a08da1fecbb6e8b46990538c7b50b2` (this is your account authorisation). **Do not delete this file**, or you will need to re-authorise your account.
4. Delete all other files in that directory. These files are appliance-specific caches and will be automatically regenerated upon restart.
5. Restart Homebridge.

If you see the error `[SDK.Error.HomeAppliance.Connection.Initialization.Failed]` in your logs, this indicates the Home Connect servers are having trouble reaching your appliance, which may also cause individual programs to fail even if the appliance appears online.

#### 🚧 Why is the Home Connect plugin not starting or showing an authorisation URL? 🚧

<!-- INCLUDES: issue-28-b9b5 -->
If the plugin is not providing an authorisation URL or does not appear to be loading, it is usually due to a configuration error in `config.json` that prevents Homebridge from identifying the platform.

### Verify Initialization
Check your Homebridge logs for the following line:
`[HomeConnect] Initializing HomeConnect platform...`

If this line is absent, Homebridge is not attempting to load the plugin. This typically occurs because:
* **Incorrect Nesting**: The `HomeConnect` platform configuration block has been accidentally placed inside the configuration of another plugin (for example, inside an `accessories` or `inputs` list of a different platform).
* **Missing Entry**: The platform is not listed within the `platforms` array of `config.json` at all.

### Correct Configuration
To resolve this:
1. Ensure the `HomeConnect` entry is a top-level item within the `platforms` array in your `config.json` file.
2. Use the **Settings** button on the **Plugins** page of `homebridge-config-ui-x` rather than editing the JSON manually. This ensures the configuration is correctly formatted and positioned.
3. Verify that the `clientid` property is set. If it is missing, the plugin will log: `Platform HomeConnect config.json is missing 'clientid' property` and stop.

### Authorisation Process
Once correctly configured and initialized, the plugin will generate a specific URL in the logs:
`[HomeConnect] Home Connect authorisation required. Please visit: https://verify.home-connect.com?user_code=XXXX-XXXX`

You must copy this URL into a web browser, sign in with your Home Connect account, and approve the request. While waiting for you to complete this, the plugin will log `Authorisation pending` every few seconds. If you receive an error regarding HTTP methods when clicking a link, ensure you are visiting the full `verify.home-connect.com` URL and not the API token endpoints directly.

#### 🚧 Why are all my appliance power switches named the same when creating automations in the Home app? 🚧

<!-- INCLUDES: issue-33-f0df -->
This is a limitation of the Apple Home app user interface rather than an issue with the plugin. When configuring automations, the Home app often displays the service name (e.g., `Power`) instead of the accessory name (e.g., `Dishwasher`), making it difficult to distinguish between multiple appliances.

To resolve this, you can:
1. **Rename the services**: In the Home app, go to the settings for each appliance and rename the specific switch or service to something unique (e.g., rename the power toggle from `Power` to `Dishwasher Power`).
2. **Use a third-party HomeKit app**: Use an alternative app like **Eve for HomeKit** or **Controller for HomeKit** to set up your automations. These apps typically provide better context by showing which accessory a service belongs to.

Refer to the [HomeKit Apps](https://github.com/thoukydides/homebridge-homeconnect/wiki/HomeKit-Apps) wiki page for more information on alternative controllers.

#### 🚧 Why is my log flooded with `Service Temporarily Unavailable` errors every second during an outage? 🚧

<!-- INCLUDES: issue-34-01de -->
When the Home Connect API experiences a service outage, you may see the plugin rapidly log attempts to restart the event stream. This behaviour is a deliberate design choice for several reasons:

1.  **State Consistency**: Because of strict API rate limits, the plugin relies almost entirely on the event stream for real-time updates. When the stream is interrupted, the plugin loses sync with your appliances. Attempting to reconnect immediately ensures that the 'window' for missed events and stale data is kept as small as possible once the service resumes.
2.  **Diagnostic Integrity**: Precise logs of every connection attempt and the specific error returned (e.g. `Service Temporarily Unavailable`) are vital for diagnosing complex or intermittent API failures. Reducing this detail or introducing delays would make it harder to identify specific failure mechanisms in the future.
3.  **API Rate Limits**: The plugin is optimised to stay within rate limits. Adding manual delays or logic to 'wait out' an outage adds significant complexity that could interfere with the normal recovery process once the servers are back online.

While this results in a high volume of logs during a service outage, it ensures the plugin recovers as quickly and reliably as possible without manual intervention.

#### 🚧 How can I trigger the Identify function for an appliance using the Eve app? 🚧

<!-- INCLUDES: issue-37-b6a0 -->
To trigger the `Identify` mechanism within the Eve app, follow these steps:

1. Navigate to the **Rooms** tab and find the appliance.
2. Tap on the name of the appliance (ensure you do not tap an active control like a toggle or slider) to open the detailed device view.
3. At the top of the screen, tap the appliance name/arrow located just below the **Edit** button.
4. Two icons will appear: a settings cog and an **ID** button.
5. Tap the **ID** button to trigger the identification sequence on the physical appliance.

#### 🚧 Why are some features for my appliance, such as hood lights, missing or not working? 🚧

<!-- INCLUDES: issue-4-f130 -->
Support for many appliances is implemented based on the official Home Connect API documentation, which can be inaccurate or incomplete. As the maintainer does not own every type of appliance and official simulators are not always available, features for certain devices (such as hoods) may be experimental or untested. If you find that a feature is missing or not functioning as expected, providing debug logs can help the maintainer refine the implementation for hardware they cannot access directly.

#### 🚧 Why do Siri commands for my hood fan work intermittently or fail while the Home app works correctly? 🚧

<!-- INCLUDES: issue-41-6e02 -->
Intermittent issues with Siri control, where the Home app continues to function correctly, are typically not caused by the plugin itself. These discrepancies usually stem from one of two sources:

1.  **Siri semantic processing**: Siri requires specific combinations of characteristics to understand device types. If Apple updates Siri's logic, it may become "confused" by the non-standard service mappings required to bridge Home Connect appliances to HomeKit. This can result in Siri being unable to process commands like turning a fan off, even if the Home app interface works perfectly.
2.  **Home Connect server instability**: Periodic unreliability of the Home Connect API servers can cause commands to fail or produce no logs within the plugin if the request never reaches the Homebridge instance.

To troubleshoot, you can enable HomeKit-level debug logging by setting the `DEBUG=*` environment variable before launching Homebridge. This will confirm whether the Siri request is actually reaching Homebridge or being dropped by the HomeKit framework.

#### 🚧 Why does the Homebridge UI state "This appliance does not support any programs"? 🚧

<!-- INCLUDES: issue-42-9162 -->
This message is displayed when the plugin is unable to retrieve a list of supported programs from the Home Connect API. This is typically caused by transient instability or temporary outages of the Home Connect servers. If you encounter this error: 1. Verify the status of the Home Connect API. 2. Restart Homebridge to trigger a new request for the appliance configuration. 3. Ensure the appliance is connected to Wi-Fi and reachable in the official Home Connect app. In most instances, this issue resolves itself once the API servers are responding correctly.

### New partition 3

<!-- PARTITION: New partition 3 -->

#### 🚧 How can I see the program remaining time or active status in HomeKit? 🚧

<!-- INCLUDES: issue-5-1a70 -->
Apple's standard **Home app** often only displays a simple power switch for certain appliances. To view more detailed information provided by the plugin, such as **Active** status or **Program Remaining Time**, you must use a third-party HomeKit app that supports a wider range of characteristic types, such as **Eve for HomeKit**.

#### 🚧 Why do I see `getaddrinfo EAI_AGAIN api.home-connect.com` in my logs? 🚧

<!-- INCLUDES: issue-50-0475 -->
This error signifies a temporary failure in DNS resolution. The system hosting Homebridge was unable to look up the IP address for the Home Connect API servers. This is usually caused by:

1. A transient loss of internet connectivity.
2. A local router or DNS server performing a scheduled reboot.
3. General network congestion.

The plugin is designed to handle these interruptions and will automatically attempt to re-establish the event stream once the network connection is restored. If this happens at a consistent time every day, check for scheduled tasks or reboots in your local network infrastructure.

#### 🚧 What values should I use for Application ID and Redirect URI when registering the Home Connect application? 🚧

<!-- INCLUDES: issue-51-db9a -->
When registering your application on the Home Connect developer portal, ensure you configure the following settings:

1. **OAuth Flow**: This **must** be set to `Device Flow`. This setting cannot be changed after the application is created. If you have an existing application set to a different flow, you must create a new one.
2. **Application ID**: This is a friendly name for your reference only. You can enter anything here, such as `Homebridge`.
3. **Redirect URI** (or Success Redirect): This field is mandatory in the form but is not used by the `Device Flow`. You can enter any valid URL, such as `https://localhost` or `https://google.com`.

Note that the default `API Web Client ID` often visible in new accounts is reserved for the official Home Connect web-based API client and will not work with this plugin. You must create your own application to obtain a compatible Client ID.

#### 🚧 Why do my Home Connect appliances remain visible in the Home app when they are turned off or offline? 🚧

<!-- INCLUDES: issue-52-2dc8 -->
It is normal for appliances to remain visible in the Home app even when they are powered off or disconnected from Wi-Fi. The plugin synchronises accessories based on the list of appliances registered to your Home Connect account. As long as the appliance is known to the Home Connect API, it will persist in HomeKit. 

The plugin only adds or removes accessories if the Home Connect API indicates that the list of appliances associated with your account has changed. Being unreachable by the Home Connect servers does not trigger the removal of the accessory from HomeKit. If you observe inconsistent behaviour, such as devices unexpectedly appearing or disappearing from the Favorites view, this may be due to a synchronisation issue within HomeKit or Homebridge. In such cases, the following steps can resolve the issue:

1. Remove the Homebridge bridge from the Home app.
2. Clear the Homebridge cache files.
3. Re-add the bridge to HomeKit.

#### 🚧 Why do I get an `npm ERR! ENOTEMPTY` error when installing or updating the plugin? 🚧

<!-- INCLUDES: issue-53-9275 -->
This is an error produced by the `npm` package manager rather than a fault within the plugin code. It typically occurs when `npm` attempts to rename or remove a directory during an update but fails because the target directory is not empty or a file is being held open by another process.

To resolve this issue:
1. Stop the Homebridge service to ensure no processes are actively using the plugin files.
2. Locate the temporary directory identified in the error log (for example, `/usr/local/lib/node_modules/.homebridge-homeconnect-XXXXXXXX`).
3. Manually delete that temporary directory and the existing `homebridge-homeconnect` directory if necessary.
4. Attempt to install the plugin again.

This error is often transient and may also be resolved by simply restarting the host system or retrying the installation via the Homebridge Config UI X interface.

#### 🚧 Why does my appliance not show ambient light colour controls in HomeKit? 🚧

<!-- INCLUDES: issue-54-f83f -->
This typically occurs when the Home Connect API fails to report colour support during the plugin's initial discovery process. Many Home Connect appliances only expose the `BSH.Common.Setting.AmbientLightColor` setting when the ambient light is actively switched on. 

While the plugin attempts to briefly enable the light during discovery to detect these capabilities, this process can fail if the appliance was recently controlled manually (which temporarily blocks remote API commands) or if there were transient network delays. To resolve this and force a re-detection of your appliance's features:

1. Ensure you are running the latest version of the plugin (a race condition affecting this was fixed in `v0.23.2`).
2. Stop Homebridge.
3. Navigate to the plugin's persistent storage directory, typically `~/.homebridge/homebridge-homeconnect/persist`.
4. Delete the cache file corresponding to your appliance. The filename is an MD5 hash of the appliance name/ID (e.g., `a7ea3482...`).
5. Ensure the appliance is not being used manually and is in standby.
6. Restart Homebridge. The plugin will perform a fresh discovery of all appliance capabilities.

#### 🚧 Can I hide the event switches or mode switches to reduce clutter in the Home app? 🚧

<!-- INCLUDES: issue-56-ce35 -->
Yes. From version `v0.32.0` onwards, the plugin provides per-appliance configuration options to selectively remove specific services. This is particularly useful for reducing the number of `Stateless Programmable Switch` services, which often appear with confusing numeric labels in the Home app due to platform limitations.

You can selectively enable or disable the following services for each appliance:
- **Events**: `Stateless Programmable Switch` services triggered by appliance events.
- **Modes**: `Switch` services for specific appliance settings (e.g. Sabbath Mode or Eco Mode).
- **Door**: The `Door` service used for monitoring door status.

To adjust these settings, navigate to the plugin configuration in the Homebridge UI, find the settings section for your specific appliance, and toggle the visibility of these services. A restart of Homebridge is required to update the HomeKit accessory cache and remove the hidden services.

#### 🚧 Why is the `HeaterCooler` service not used for fridge or freezer temperature control? 🚧

<!-- INCLUDES: issue-58-06c5 -->
The `HeaterCooler` service in HomeKit is designed specifically for environmental climate control, such as room thermostats or air conditioning units. Using this service for appliances like fridges, freezers, or ovens introduces several issues with Siri and HomeKit semantics:

1. Siri conflates the appliance's internal temperature with the ambient room temperature. Asking "What is the temperature in the kitchen?" would include the fridge temperature in the calculation of the room's temperature range.
2. Commands to adjust climate control could affect the appliance. For example, asking Siri to set the room to a specific temperature might inadvertently attempt to set the fridge or freezer to that same temperature if they are assigned to the same HomeKit room.
3. The "mode dial" functionality used in some climate services does not have a documented or consistent mapping for appliance-specific modes (like Sabbath or Super-Cooling) that ensures sensible voice control behaviour.

To maintain the integrity of voice control via Siri, this plugin exposes fridge and freezer modes (such as Super, Eco, Vacation, and Fresh modes) as individual `Switch` services rather than a combined climate control interface. This ensures that these features can be controlled independently without breaking the semantic model of the home's environmental settings.

#### 🚧 Why does the Elgato Eve app show my appliance as inactive or having an error? 🚧

<!-- INCLUDES: issue-6-5287 -->
The **Elgato Eve** app interprets HomeKit characteristics more strictly than the standard Apple Home app. Specifically, it uses the `Status Active` characteristic as a health indicator. When this value is `false`, Eve displays a red warning triangle or the message `The accessory is inactive. Please refer to its user manual.`, even if there is no actual fault.

The plugin maps Home Connect operation states to HomeKit to minimize these misleading warnings while still providing accurate status. Under the current mapping, the following states will trigger the **Inactive** warning in Eve:
* `Pause`: The appliance program has been suspended.
* `ActionRequired`: The appliance requires manual intervention (e.g. closing a door or refilling a consumable).
* `Error`: The appliance has encountered a functional error.
* `Aborting`: The appliance is currently cancelling the active program.

Idle states like `Ready` or `Finished` are mapped to `Status Active = true` specifically to prevent Eve from showing an error state when the appliance is simply waiting to be used. Note that other HomeKit apps, such as **Home+**, may display these characteristics differently (e.g. as a boolean Yes/No for Status Active).

#### 🚧 Why does the log show `Unauthorized client: grant_type is invalid`? 🚧

<!-- INCLUDES: issue-60-3cca -->
This error indicates a configuration mismatch between the Home Connect Developer Portal and the plugin settings. To resolve this, verify the following in the [Home Connect Developer Portal](https://developer.home-connect.com/applications):

1. Ensure that **OAuth Flow** is set to **Device Flow** for your application. It defaults to *Authorization Code Grant Flow*, which is not supported by this plugin.
2. Verify that the `clientid` in your Homebridge configuration matches the **Client ID** assigned to the specific application you created. Do not use the ID for the automatically created *API Web Client*.
3. Ensure the `simulator` option in your configuration is set to `false` (or omitted entirely) unless you are specifically testing against the Home Connect appliance simulators.

#### 🚧 How do I complete the Home Connect authorisation process if the link fails or prompts for a code? 🚧

<!-- INCLUDES: issue-60-6eaf -->
When the plugin starts or requires re-authorisation, it generates a unique URL in the Homebridge log. To complete the process:

1. Copy the entire URL from the log (e.g. `https://api.home-connect.com/security/oauth/device_verify?user_code=1234-5678`) into your web browser.
2. When prompted to log in, you **must** use the same email address and password that you use for the official Home Connect mobile app where your appliances are registered. Do not use your Developer Portal credentials if they are different.
3. Approve the request to access your appliances. You will then be redirected to the `Redirect URI` specified in your developer application settings.
4. The plugin will automatically detect the completion, retrieve the tokens, and save them to your configuration. 

If you see errors like `HTTP method not allowed`, ensure you are using the full URL provided in the logs and not attempting to manually visit API endpoints.

#### 🚧 Why doesn't the plugin use a Valve service to show the remaining time for dishwashers or washing machines? 🚧

<!-- INCLUDES: issue-68-c945 -->
The HomeKit `Valve` service (including its sub-types like `Irrigation` or `Shower Head`) is not used for displaying remaining time because it is semantically inappropriate for many Home Connect appliances, such as ovens, hoods, or dryers. To maintain a consistent experience across all supported hardware, the plugin instead adds the `RemainingDuration` characteristic to the **Active Program Switch**.

While the native Apple Home app does not always display this timer prominently, it is fully accessible for both viewing and automation in third-party HomeKit applications (e.g. Eve, Home+, or Controller for HomeKit). Using a `Valve` service for only specific appliance types would create an inconsistent architectural model and would break existing automations that rely on the current service structure.

#### 🚧 Why is my Home Connect appliance unresponsive in Homebridge but working in the Home Connect app? 🚧

<!-- INCLUDES: issue-71-a9f3 -->
The Home Connect mobile app primarily communicates with appliances via the local Wi-Fi network when your phone is connected to the same network. In contrast, this plugin (and all third-party integrations) must use the public Home Connect cloud API. It is possible for an appliance to have a working local connection but a broken or stalled cloud connection.

To diagnose this, disable Wi-Fi on your mobile device to force the Home Connect app to use a cellular (remote) connection. If the appliance becomes unresponsive in the app while on cellular data, the issue lies with the appliance's connection to the Home Connect servers rather than the plugin.

You can often resolve this by: 
1.  Opening the **Home Connect app**.
2.  Navigating to the **Settings** for the specific appliance.
3.  Checking the **Network** section to ensure all three connection lines (appliance to cloud, cloud to phone) are green.
4.  Toggling the **Connection to server** setting off and then back on again to force a reconnection to the cloud API.

#### 🚧 Why do appliance status updates stop appearing in HomeKit while the plugin is still connected? 🚧

<!-- INCLUDES: issue-74-d6d6 -->
The `homebridge-homeconnect` plugin relies on a long-lived HTTP event stream from the Home Connect API to receive real-time updates. The API sends a `KEEP-ALIVE` event approximately every 55 seconds to maintain the connection. If the plugin does not receive any activity for 120 seconds, it will automatically tear down and re-establish the stream, which is often logged as `ESOCKETTIMEDOUT`.

In some cases, the connection may remain technically active (with `KEEP-ALIVE` heartbeats still arriving) while the Home Connect backend stops sending actual state change events (such as power on/off or program status). This is typically a result of a failure in the Home Connect backend distribution service rather than a fault in the plugin or your local network. A major instance of this behaviour was resolved by a Home Connect backend update in April 2022.

If you experience a stall where updates stop but no errors appear in the logs:
1. Check if the official Home Connect app is still receiving real-time updates. The app often establishes a fresh connection upon opening, which may mask an underlying stream failure affecting the plugin.
2. Restart Homebridge to force the plugin to subscribe to a new event stream.
3. Verify your network configuration. Ensure that your router or firewall is not prematurely terminating long-lived TCP connections (the default TCP idle timeout is typically 300 seconds).

#### 🚧 Why can't I set the alarm timer or `AlarmClock` setting on my appliance? 🚧

<!-- INCLUDES: issue-77-7f97 -->
HomeKit does not currently define services or characteristics with the correct semantics for a general-purpose appliance alarm timer. Mapping this functionality to existing, unrelated HomeKit services would result in incorrect behaviour and cause issues when using Siri. To maintain HomeKit consistency and ensure reliable voice control, the plugin does not support setting the `BSH.Common.Setting.AlarmClock` timer.

#### 🚧 What does the log message `Selected program ... is not supported by the Home Connect API` mean? 🚧

<!-- INCLUDES: issue-78-c9c7 -->
This message is a cosmetic warning that occurs when an appliance reports a program selection event before the plugin has finished fetching or loading the list of supported programs from the Home Connect API. This most commonly happens during the initial plugin startup or after the local cache has been cleared.

The plugin avoids requesting specific options for a program until it has confirmed the program's existence in the supported list. Once the full list of programs is retrieved from the API, the plugin will automatically fetch the necessary details. This message does not indicate a functional failure and can be safely ignored if it only appears briefly during startup or cache refresh operations.

#### 🚧 Why can't I see the Pause or Resume options in the Apple Home app? 🚧

<!-- INCLUDES: issue-8-226b -->
Experimental support for pausing and resuming appliance programs is implemented via the HomeKit `Active` characteristic. Apple's native Home app does not display this specific characteristic for most appliance types. To access these controls, you must use a third-party HomeKit app that supports a wider range of characteristics, such as Eve for HomeKit or Home+.

#### 🚧 Why is the Pause/Resume support inconsistent between my Home Connect appliances? 🚧

<!-- INCLUDES: issue-8-5b9e -->
Support for the `PauseProgram` and `ResumeProgram` commands varies significantly between different appliance types and firmware versions, often deviating from the official Home Connect API documentation. While the API documentation suggests broad support, the plugin has found that:

1. Many appliances (including some Dishwashers and Ovens) do not support these commands via the public API despite documentation claims.
2. Some appliances, such as certain Siemens Washers, may support `PauseProgram` but not `ResumeProgram`.
3. The plugin (v0.19.0 and later) dynamically detects available commands for each appliance and only exposes supported functions. If the options are missing, your specific hardware or firmware likely does not support the feature via the Home Connect API.

#### 🚧 Why am I redirected to a SingleKey ID page during authorisation? 🚧

<!-- INCLUDES: issue-82-2ddc -->
Home Connect has transitioned to using SingleKey ID for user authentication. Even if your Home Connect mobile app still uses a legacy login, the web-based authorisation flow used by this plugin may require a SingleKey ID.

To resolve this:
* Create a SingleKey ID account at `singlekey-id.com` using the **same email address** as your existing Home Connect account.
* Ensure the email address is written in **all lowercase letters**. The Home Connect backend performs case-sensitive comparisons against developer portal entries (which are forced to lowercase), and mismatched casing can result in `invalid_client` errors.
* Avoid using 'plus' email addresses (e.g. `user+homebridge@example.com`) as these are inconsistently supported across the different Home Connect and SingleKey ID systems.

#### 🚧 Why do I see `Home Connect API error: Device authorization session not found, expired or blocked [expired_token]` during setup? 🚧

<!-- INCLUDES: issue-97-1958 -->
This error occurs during the initial authorisation process if the device code expires or is used more than once. The Home Connect API provides a limited window, typically 10 minutes, for you to visit the authorisation URL provided in the Homebridge logs and complete the login process. If this time limit is exceeded, or if the URL is accessed multiple times, the session becomes invalid.

The plugin handles this error gracefully by waiting 60 seconds before automatically starting a new authorisation attempt. To resolve the issue, check the Homebridge logs for a fresh authorisation URL and complete the verification process promptly within the 10-minute window.

<!-- EXCLUDED: issue-3-b11b issue-3-e25e issue-5-7189 issue-10-f54e issue-13-d6c6 issue-17-9299 issue-21-4a0f issue-32-3eeb issue-36-116c issue-43-3166 issue-47-127f issue-65-324a issue-67-1639 issue-77-48d3 issue-77-ea0e issue-78-26c0 issue-80-1fb6 issue-84-bee9 issue-85-0a95 issue-89-ea9b issue-91-e7db issue-93-7521 issue-97-c838 -->
