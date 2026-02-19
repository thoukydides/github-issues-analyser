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

### Plugin and API Behaviour

<!-- PARTITION -->

#### How can I find the `haID` (Home Appliance ID) for my appliance?

<!-- INCLUDES: issue-1-2779 -->
The `haID` is a unique identifier required for customising appliance configurations in `config.json`. You can find this value in several ways:

1. In HomeKit apps, it is displayed as the appliance's **Serial Number**.
2. By using the **Identify** function on the accessory within your HomeKit app, which will write the full appliance details (including the `haID`) to the Homebridge log.
3. When debug mode is enabled (`DEBUG=*`), the `haID` is included in almost all log entries and Home Connect request URLs.

The format typically follows a pattern like `MANUFACTURER-MODEL-HEXADECIMAL_ID`.

#### Why does my appliance occasionally show as not available or return `SDK.Error.504.GatewayTimeout`?

<!-- INCLUDES: issue-11-d4f5 -->
The `SDK.Error.504.GatewayTimeout` error message indicates that the Home Connect cloud servers are experiencing internal issues or high latency. This is a server-side problem with the Home Connect API infrastructure and is not caused by the plugin. Users may observe that an appliance remains responsive within the official Home Connect mobile app while failing via HomeKit, as the app and the public API can use different communication paths or experience different levels of load. If these errors occur frequently, it usually indicates transient instability in the Home Connect service.

#### Why does the Eve app show my appliance as 'Inactive' when it is idle?

<!-- INCLUDES: issue-1-96fa -->
When an appliance is switched on but not currently running a programme, its state is logically **Inactive**. The Eve app specifically chooses to highlight this status in a way that can appear like a warning or an error. This is a user interface decision made by the Eve app developers; other HomeKit applications do not typically treat the idle state as a negative status.

#### Why am I seeing the error `HomeAppliance connection initialization failed [SDK.Error.HomeAppliance.Connection.Initialization.Failed]`?

<!-- INCLUDES: issue-1-e985 issue-113-d74c -->
This error is returned by the Home Connect API and indicates that the cloud servers were unable to communicate with your appliance. It is not an authorisation issue and cannot be resolved by regenerating tokens or re-authorising the plugin.

According to the Home Connect API documentation, this error occurs when:
1. The appliance is offline or powered down.
2. The appliance failed to respond to connection requests within the required timeout.
3. There are transient connectivity issues between the appliance, your local network, and the Home Connect servers.

This behaviour is frequently caused by flaky Home Connect server infrastructure or local Wi-Fi instability. If you encounter this error, verify if the appliance is controllable via the official Home Connect mobile app. Often, the issue is temporary and will resolve itself without intervention.

#### Why do all services for my appliance have the same name in the Home app since updating to iOS 16?

<!-- INCLUDES: issue-108-a5c4 issue-116-e2ec -->
iOS 16 introduced changes to how the Home app displays names for accessories containing multiple services. In many cases, it defaults to showing the name of the parent accessory rather than the unique name of the individual service (such as specific buttons or sensors on a dishwasher).

To address this, the plugin (from version 0.27.0 onwards) includes the `Configured Name` characteristic for `Switch`, `Stateless Programmable Switch`, and `Lightbulb` services. This allows the Home app to display the correct programme names (e.g. `Cappuccino`, `Espresso`) for most tiles.

If you are still seeing generic names:
1. Ensure you are running version 0.27.0 or later of the plugin.
2. If names do not update automatically, you may need to manually rename the individual services within the Home app to restore your preferred labels.
3. Note that `Stateless Programmable Switch` services may still appear as numeric buttons in the Apple Home app due to iOS-specific limitations. Third-party apps like **Eve** or **Home+** may display these more clearly.

#### Why am I getting the error `client has limited user list - user not assigned to client [invalid_client]`?

<!-- INCLUDES: issue-115-c713 -->
This error is returned by the Home Connect API servers and indicates that the account you are using to log in is not authorised to use the specific Developer Application you created. This is usually caused by a configuration mismatch in the Home Connect Developer Portal.

To resolve this, verify the following settings on the [Home Connect Developer Portal](https://developer.home-connect.com/):

1. Check the **Home Connect User Account for Testing** field within your application settings. This must exactly match the email address used for your Home Connect mobile app.
2. Verify the **Default Home Connect User Account for Testing** in your developer profile settings.
3. If you have recently migrated your account to **SingleKey ID**, ensure that your developer profile and application settings have been updated to reflect the correct email address.

If the configuration is correct but the error persists or reappears after a short period of working, it may indicate a server-side issue with your specific account. In such cases, you should contact [Home Connect Developer Support](https://developer.home-connect.com/support/contact) directly, as this cannot be resolved within the plugin.

#### What does the error `BSH.Common.Error.WriteRequest.Busy` mean?

<!-- INCLUDES: issue-116-1125 -->
The `BSH.Common.Error.WriteRequest.Busy` error is returned by the Home Connect cloud servers when a command is sent to an appliance that is currently unable to process it.

This typically occurs when:
* The appliance requires physical user interaction (e.g. a coffee machine needs its drip tray emptied or water tank filled).
* The appliance is in a state where it cannot accept the specific command (e.g. attempting to start a programme while a door is open or a cleaning cycle is active).
* There is a transient issue with the Home Connect cloud service itself.

If you encounter this error, check the physical display of the appliance or the official Home Connect app to see if a manual action is required.

#### Why does the power button for my oven not work?

<!-- INCLUDES: issue-112-6c3a -->
Failure to power an oven on or off is frequently attributed to a bug in the Home Connect API. This is a known issue affecting specific appliance models where the power commands are either ignored or rejected by the Home Connect servers. If you experience this behaviour, please report it directly to [Home Connect Developer Support](https://developer.home-connect.com/support/contact). Include your appliance's part number (E-Nr) and details of the failure. This is an external platform limitation that cannot be resolved through plugin updates.

#### Why does the plugin fail with `request rejected by client authorization authority (developer portal)`?

<!-- INCLUDES: issue-117-1a0f -->
This error message is returned directly by the Home Connect API servers and indicates that the authorisation request was rejected before reaching the plugin. This is typically caused by a configuration mismatch between the plugin settings and the application registration in the Home Connect developer portal.

To resolve this issue, please verify the following in the [Home Connect Developer Portal](https://developer.home-connect.com/applications):

1. **Client ID**: Ensure that the `Client ID` configured in the plugin exactly matches the one shown in your developer account. A single incorrect character will cause the authorisation to fail.
2. **Success Redirect**: Ensure that a valid URL is entered in the **Success Redirect** field of your application configuration. If this field is empty or contains an invalid URI, the API will reject the request with a `400 unauthorized_client` error.

If you have confirmed both settings and the error persists, you may need to delete and recreate the application in the developer portal to reset its state.

#### Why does SingleKey ID show a session expired error or fail to redirect during authorisation?

<!-- INCLUDES: issue-118-9a71 -->
Authorisation issues occurring after the plugin has provided the initial login URL are typically caused by the Home Connect or SingleKey ID services rather than the plugin itself. In some instances, the SingleKey ID website may fail to redirect back to the authorisation handler due to restrictive Content Security Policy (CSP) directives.

If you encounter a session expiry message or the page stalls after logging in, try the following workaround:
1. Restart the authorisation process from the plugin configuration.
2. On the SingleKey ID login screen, ensure you tick the **Stay logged in** option.
3. If the page still fails to redirect automatically after signing in, open your browser's developer tools (usually `F12` or right-click and select **Inspect**).
4. Look for the callback URL in the network logs or console and manually navigate to it to complete the process.

#### Why do I get a `Device authorization session has expired` error during setup?

<!-- INCLUDES: issue-121-ccc6 -->
This error typically occurs when the SingleKey ID account used for authorisation is not fully configured or verified in the official mobile app. To resolve this:

1. Open the official Home Connect app on your mobile device.
2. Ensure you are logged in with the same SingleKey ID used for the Homebridge plugin.
3. Verify that your account profile is complete and any pending email verifications or terms of service acceptances have been processed.
4. Once the account is fully active and functional within the mobile app, restart the plugin and attempt the authorisation process again.

#### Can I disable the power or active programme switches for my appliance?

<!-- INCLUDES: issue-124-2e72 -->
You can control which individual programme switches are provided by using the `addprograms` option in your `config.json` file. However, the `Switch` services for appliance power and the active programme are fundamental to the plugin's architecture and cannot be disabled via configuration. If you wish to avoid accidental activation, consider moving these switches to a different room or a 'Technical' zone within the Home app.

#### Why is the remaining programme time or current stage not visible in the Home app?

<!-- INCLUDES: issue-124-9bb6 -->
There are two main reasons why this information may be missing:

1. **API Limitations**: Most Home Connect appliances (except for the Roxxter cleaning robot) do not report specific programme stages like 'rinsing' or 'spinning'. They only provide elapsed time, remaining time, and percentage completion.
2. **HomeKit Display**: The plugin provides a `Remaining Program` characteristic, but the official Apple Home app does not support displaying it. To see the remaining duration, you must use a third-party HomeKit app that supports a wider range of characteristic types.

#### How can I get notifications for programme completion or low detergent levels?

<!-- INCLUDES: issue-124-8aea -->
The Apple Home app only generates native notifications for a restricted set of characteristics, primarily those related to security (such as doors). It does not support native notifications for appliance programme states or consumable levels.

To receive these alerts, you can use the `Stateless Programmable Switch` services provided by the plugin for events like `Program Finished` or `i-Dos Low`. These services allow you to create HomeKit automations that can trigger custom actions or notifications when the specific event occurs.

#### Why do I get "The code entered is invalid or has expired" when authenticating?

<!-- INCLUDES: issue-125-9208 -->
This error typically occurs during the initial OAuth authorisation process due to one of the following reasons:

1. **Propagation Delay**: When you create or modify an application on the Home Connect Developer Portal, it can take up to 15 minutes for those changes to be synchronised across their authorisation servers. If you attempt to authenticate immediately, the request may be rejected.
2. **Code Expiration**: The verification codes generated for the `device_verify` URL are only valid for 10 minutes. If you use an older link, it will have expired.
3. **Stale UI Links**: If you are using the Homebridge Config UI X web interface, the verification link shown in the plugin configuration does not update automatically. You must close and re-open the configuration editor to see a fresh link. Alternatively, check the Homebridge logs, as a new URL is logged every 10 minutes until authorisation is successful.

If you continue to experience issues after waiting 15 minutes and using a fresh link from the logs, contact Home Connect support via their developer portal.

#### Why are there no log entries for several hours even though the plugin is running?

<!-- INCLUDES: issue-13-159f -->
If no appliances are being used and no status changes are occurring, it is normal for the plugin to remain silent in the logs. By default, log entries are only generated when an appliance is controlled via HomeKit, the Home Connect event stream reports a change in appliance state, or a connection error occurs. When running with debug logging (`-D`) enabled, the plugin polls the appliance list approximately once per hour, but otherwise remains quiet unless there is activity. The absence of log updates does not indicate that the plugin or Homebridge has frozen.

#### What does a `Proxy Error` in the logs mean?

<!-- INCLUDES: issue-13-daa9 -->
A `Proxy Error` indicates that the Home Connect API servers unexpectedly terminated the event stream. This is a server-side issue within the Home Connect infrastructure and is not caused by the plugin. The plugin is designed to handle these interruptions by automatically attempting to re-establish the connection. If these errors occur frequently, it usually indicates transient instability in the Home Connect cloud service.

#### Why are fridge door alarms not mapped to stateful Door or Security services in HomeKit?

<!-- INCLUDES: issue-132-67f7 -->
Home Connect events, such as door alarms or temperature warnings, are essentially stateless within the API for several reasons:

* **No Polling for State**: The API provides no mechanism to query whether an event is currently active when Homebridge starts or after a loss of connectivity.
* **Inconsistent Event Clearing**: While the API reports when an event occurs (e.g. `EventPresentState.Present`), the reporting of the 'off' state is inconsistent across different appliance types and firmware versions. Many appliances simply stop sending the 'present' event rather than explicitly sending a 'cleared' event.
* **API Undocumented Behaviour**: The frequency of repeated alarm events is not documented, making it unreliable to implement a timeout-based state system.

Because of these limitations, the plugin maps these events to `Stateless Programmable Switch` services. These can be used to trigger HomeKit automations, but they cannot reliably represent a persistent 'alarm active' state.

#### Why am I seeing `Home Connect API error: getaddrinfo EAI_AGAIN api.home-connect.com` in my logs?

<!-- INCLUDES: issue-137-6081 -->
The error `getaddrinfo EAI_AGAIN` is a standard networking error indicating a temporary failure in DNS name resolution. This means your local system or Homebridge host is unable to resolve the IP address for the Home Connect API servers. To resolve this issue:

1. Check your local network's DNS settings and ensure your Homebridge server has a stable internet connection.
2. Verify that your DNS provider is not experiencing outages or blocking requests to `api.home-connect.com`.
3. If you are using a specific environment like HOOBS, ensure that the underlying operating system's networking stack is correctly configured.

This is a local environment issue and cannot be resolved by changing the plugin's configuration.

#### Why does the ice maker toggle not appear for my Home Connect fridge?

<!-- INCLUDES: issue-141-5245 -->
The ability to control an ice maker depends on the appliance exposing the `Refrigeration.FridgeFreezer.Setting.DispenserEnabled` setting via the Home Connect API. This feature was implemented in the plugin starting with version 0.29.0.

If the control is missing in HomeKit, it indicates that the appliance firmware or the specific model does not support this setting through the API. The plugin can only expose functionality that the Home Connect API explicitly provides for a connected device; it cannot control features that are only available via physical buttons or the official app if they are not also part of the public API.

### Troubleshooting and Plugin Behaviour

<!-- PARTITION -->

#### Why is the plugin not starting or failing during the account authorisation process?

<!-- INCLUDES: issue-28-b9b5 issue-151-9c3a issue-162-1a03 -->
If the plugin fails to start or provide an authorisation URL, it is usually due to a configuration error. Ensure the `HomeConnect` platform block is a top-level item within the `platforms` array of your `config.json` and not nested inside another plugin. The `clientid` must be present and exactly match the Client ID from the Home Connect Developer Portal.

During authorisation, note the following:
* **Link Expiry**: The generated authorisation link is valid for only 30 minutes. If it expires, restart Homebridge to generate a new one.
* **401 Unauthorized**: If you see `client has limited user list - user not assigned to client`, ensure the email address used for authorisation matches the one registered in both the Home Connect app and the Developer Portal. Changes in the portal can take up to 48 hours to propagate.
* **Display Issues**: If the link appears as `[object Promise]`, update the plugin to at least `v0.29.5` to resolve a historical UI bug.

#### Why is my appliance reported as offline or experiencing connection errors like `Gateway Timeout`?

<!-- INCLUDES: issue-15-25d9 issue-19-6154 issue-34-01de issue-42-9162 -->
The `The appliance is offline` status indicates the plugin has lost its connection to the Home Connect Event Stream, which is required for real-time updates. This can occur even if the appliance appears functional in the official Home Connect app, as the official app uses different communication methods. 

Errors such as `SDK.Error.504.GatewayTimeout`, `Proxy Error`, or `Service Temporarily Unavailable` are returned directly by the Home Connect servers and indicate backend instability. During such outages, the plugin may flood the log with reconnection attempts. This is a deliberate design to ensure the plugin synchronises as quickly as possible once the service is restored, minimising the window for stale data and missed events. If the UI states `This appliance does not support any programs`, this is typically a transient API error that resolves after a restart once the servers are responsive.

#### Why do I see API errors such as `InvalidStepSize`, `ProgramNotAvailable`, or `InvalidSettingState`?

<!-- INCLUDES: issue-18-1fff issue-22-3aca issue-186-6cfd -->
These errors occur when a command violates the constraints of the Home Connect API:

* **`InvalidStepSize`**: Values for certain options (like `FillQuantity`) must be exact multiples of a specific increment. Ensure you use the provided dropdowns or snap to the correct increments in the Homebridge UI.
* **`ProgramNotAvailable` / `409 Conflict`**: This occurs when a program is known to the plugin but the API rejects it, often because remote start is not supported for that model or a required precondition has not been met. You can verify available programs by enabling `Log API Bodies` debug logging.
* **`InvalidSettingState`**: Commonly seen with coffee machines when the power switch is toggled while a maintenance prompt (e.g. "Change water filter") is active on the physical display. You must resolve these prompts manually on the appliance before remote control can resume.

#### How can I improve the display and control of appliances in the Apple Home app?

<!-- INCLUDES: issue-2-d759 issue-33-f0df issue-37-b6a0 issue-149-a6ae -->
Apple's Home app has inherent limitations that can be addressed with specific configurations:

* **Grouping**: Coffee machines expose multiple switches (Power, Active Program, etc.) which Home may group into one tile. Toggling this combined tile often fails because the machine cannot start a program while powering on. Select **Show as Separate Tiles** in the accessory settings to control these individually.
* **Naming**: If multiple appliances show identical switch names (e.g. `Power`) in automations, rename the services within the Home app (e.g. `Dishwasher Power`) for clarity.
* **Hidden Data**: Home does not display `Remaining Duration` or detailed states. Use third-party apps like **Eve** or **Home+** to view these. The plugin also provides `Stateless Programmable Switch` services for automation triggers when programs finish.
* **Identify**: To trigger the `Identify` function in the Eve app, tap the appliance name in the room view, then tap the name again at the top of the detail screen to reveal the **ID** button.

#### Why are some features or programs from the official app missing from the plugin?

<!-- INCLUDES: issue-2-c470 issue-4-f130 issue-188-cb08 -->
The plugin is constrained by the public Home Connect API. Features like Dryer AutoSense or specific advanced programs may be available to official partners like IFTTT via private APIs but are not exposed to third-party developers. If a feature is not in the [official API documentation](https://api-docs.home-connect.com/programs-and-options/), it cannot be supported.

Additionally, support for some appliances like hoods is experimental as the maintainer may not have access to the hardware; providing debug logs can help refine these. For multi-cavity appliances, errors like `BSH.Common.Error.InvalidUIDValue` may occur if the API advertises a secondary cavity that lacks remote capabilities. The plugin handles this by disabling control for that specific cavity.

#### Why does Siri control for my appliances behave differently than the Home app?

<!-- INCLUDES: issue-2-ee14 issue-41-6e02 -->
Intermittent Siri failures, even when the Home app works, are usually due to Siri's semantic processing. Siri requires specific characteristic combinations to identify devices; if Apple updates this logic, Siri may fail to understand previously working commands. For hoods, Siri maps fan speeds to specific percentages: **Low** (25%), **Medium** (50%), and **High** (100%). You should use percentage-based commands like `set the hood fan to 50%`. To determine if a Siri command is reaching the plugin, enable HomeKit-level debug logging by setting the `DEBUG=*` environment variable.

#### How do I resolve 'Not Responding' status or configuration issues with specific appliances?

<!-- INCLUDES: issue-25-8397 issue-26-a87b issue-164-bbc4 -->
If an appliance or program shows `Not Responding`, the cached metadata may be stale. Trigger the **Identify** function in HomeKit to force the plugin to refresh supported programs from the API. For more persistent issues, you can clear the plugin's cache by deleting all files in the `persist` directory (typically `~/.homebridge/homebridge-homeconnect/persist`) except for the file starting with `94a08da1fecbb6e8b46990538c7b50b2`, which contains your authorisation.

If you find that `Program Switches` are still visible after disabling them, ensure the `haId` in your `config.json` exactly matches the identifier in the logs, including case and punctuation. If multiple unrelated plugins show `No Response`, this indicates a Homebridge process-level issue; consider using child bridges to isolate the Home Connect plugin from other services.

### Plugin Configuration and Troubleshooting

<!-- PARTITION -->

#### How do I correctly configure the Home Connect application and complete the authorisation process?

<!-- INCLUDES: issue-51-db9a issue-60-3cca issue-60-6eaf issue-82-2ddc issue-97-1958 -->
When registering your application on the [Home Connect Developer Portal](https://developer.home-connect.com/applications), you **must** set the **OAuth Flow** to `Device Flow`. This setting cannot be changed after creation; if it is incorrect, you must create a new application. The **Application ID** is for your reference (e.g., `Homebridge`), and the **Redirect URI** must be a valid URL (e.g. `https://localhost`), though it is not used by the `Device Flow`. Do not use the default `API Web Client ID` provided by Home Connect.

To complete authorisation, copy the unique URL from the Homebridge log (e.g. `.../device_verify?user_code=...`) into your browser. You must log in using the same credentials as your Home Connect mobile app, which now requires a **SingleKey ID**. Ensure the email address is in all lowercase to avoid `invalid_client` errors. If you receive an `expired_token` or `session not found` error, the 10-minute window has likely expired or the link was reused; wait for the plugin to log a fresh URL and try again.

#### Why can't I see program remaining time, active status, or pause/resume controls in the Home app?

<!-- INCLUDES: issue-5-1a70 issue-8-226b -->
Apple's standard **Home app** has limited support for many appliance characteristics. While the plugin provides detailed information such as **Active** status, **Program Remaining Time**, and experimental **Pause/Resume** controls (via the `Active` characteristic), these are often not displayed in the native Home app. To access these features, you must use a third-party HomeKit app that supports a wider range of service and characteristic types, such as **Eve for HomeKit**, **Home+**, or **Controller for HomeKit**.

#### Why is my appliance unresponsive in Homebridge but working in the Home Connect app?

<!-- INCLUDES: issue-71-a9f3 -->
The Home Connect mobile app primarily communicates with appliances via the local Wi-Fi network when your phone is on the same network. In contrast, this plugin (and all third-party integrations) must use the public Home Connect cloud API. It is possible for an appliance to have a working local connection but a stalled cloud connection.

To diagnose this, disable Wi-Fi on your mobile device to force the Home Connect app to use a cellular (remote) connection. If the appliance becomes unresponsive in the app while on cellular data, the issue lies with the appliance's connection to the Home Connect servers. You can often resolve this by checking the **Network** section in the appliance settings within the Home Connect app and toggling the **Connection to server** setting off and then back on.

#### Why do status updates stop appearing in HomeKit even though the plugin is connected?

<!-- INCLUDES: issue-74-d6d6 -->
The plugin relies on a long-lived HTTP event stream from the Home Connect API. While the plugin automatically reconnects if the stream times out (e.g. `ESOCKETTIMEDOUT`), the connection can sometimes remain technically active (receiving `KEEP-ALIVE` heartbeats) while the backend stops sending actual state change events. This is typically a failure in the Home Connect backend distribution service.

If updates stall:
1. Check if the official Home Connect app is still receiving real-time updates (the app may mask failures by establishing a fresh connection on open).
2. Restart Homebridge to force the plugin to subscribe to a new event stream.
3. Verify that your router or firewall is not prematurely terminating long-lived TCP connections (ensure a TCP idle timeout greater than 300 seconds).

#### Why do my appliances remain visible in the Home app when they are turned off or offline?

<!-- INCLUDES: issue-52-2dc8 -->
The plugin synchronises accessories based on the list of appliances registered to your Home Connect account. As long as the appliance is known to the Home Connect API, it will persist in HomeKit even if it is powered off or disconnected from Wi-Fi. Accessories are only removed if the API indicates they are no longer associated with your account. If you see inconsistent behaviour, removing the Homebridge bridge from the Home app, clearing the cache files, and re-adding the bridge can resolve synchronisation issues.

#### Why is the `HeaterCooler` service not used for fridge or freezer temperature control?

<!-- INCLUDES: issue-58-06c5 -->
The `HeaterCooler` service in HomeKit is designed for environmental climate control. Using it for kitchen appliances would cause Siri to conflate the appliance's internal temperature with the ambient room temperature. For example, asking "What is the temperature in the kitchen?" would include the fridge's internal temperature in the average. Furthermore, commands to adjust the room temperature might inadvertently change the fridge or freezer settings. To maintain semantic integrity, this plugin instead exposes fridge and freezer modes (like Super-Cooling or Eco) as individual `Switch` services.

#### Why does the Eve app show my appliance as inactive or having an error?

<!-- INCLUDES: issue-6-5287 -->
The **Eve for HomeKit** app uses the `Status Active` characteristic as a health indicator. When this value is `false`, Eve displays a warning triangle or an "inactive" message. The plugin maps specific Home Connect states to this characteristic to provide accurate status. The following states will trigger the **Inactive** warning in Eve:
* `Pause`: The program has been suspended.
* `ActionRequired`: Manual intervention is needed (e.g. closing a door or refilling consumables).
* `Error`: A functional error has occurred.
* `Aborting`: The program is being cancelled.

Idle states like `Ready` or `Finished` are mapped to `Status Active = true` to prevent misleading error warnings when the appliance is simply waiting to be used.

#### Why doesn't the plugin use a `Valve` service to show the remaining time for dishwashers or washing machines?

<!-- INCLUDES: issue-68-c945 -->
The HomeKit `Valve` service is semantically intended for irrigation or plumbing and is inappropriate for appliances like ovens or dryers. To maintain a consistent experience across all supported hardware, the plugin adds the `RemainingDuration` characteristic to the **Active Program Switch**. While not always displayed prominently in the native Apple Home app, this timer is fully accessible for viewing and automation in third-party HomeKit applications like Eve or Home+.

#### Why is Pause/Resume support inconsistent between different Home Connect appliances?

<!-- INCLUDES: issue-8-5b9e -->
Support for the `PauseProgram` and `ResumeProgram` commands varies significantly between appliance types and firmware versions, often deviating from the official Home Connect API documentation. Many appliances (including certain dishwashers, ovens, and washers) do not support these commands via the public API despite documentation claims. The plugin dynamically detects available commands for each appliance; if the options are missing, your specific hardware likely does not support the feature via the API.

#### Why does my appliance not show ambient light colour controls in HomeKit?

<!-- INCLUDES: issue-54-f83f -->
Many Home Connect appliances only expose the `BSH.Common.Setting.AmbientLightColor` setting when the light is actively switched on. While the plugin attempts to briefly enable the light during discovery to detect these capabilities, this can fail due to manual control blocks or network delays. To force a re-detection:
1. Ensure you are on the latest plugin version (a fix for this was included in `v0.23.2`).
2. Stop Homebridge and delete the appliance cache file in `~/.homebridge/homebridge-homeconnect/persist` (named with an MD5 hash).
3. Ensure the appliance is in standby and not in manual use.
4. Restart Homebridge to trigger a fresh discovery.

#### Can I hide the event switches or mode switches to reduce clutter in the Home app?

<!-- INCLUDES: issue-56-ce35 -->
Yes. Per-appliance configuration options allow you to selectively remove specific services to reduce clutter. This is particularly useful for hiding `Stateless Programmable Switch` services (Events) or `Switch` services for specific modes (e.g. Sabbath or Eco Mode). Navigate to the plugin configuration in the Homebridge UI, find the settings for your appliance, and toggle the visibility of these services. A restart is required to update the HomeKit accessory cache.

#### Why do I see `getaddrinfo EAI_AGAIN api.home-connect.com` in my logs?

<!-- INCLUDES: issue-50-0475 -->
This error signifies a temporary failure in DNS resolution, meaning your Homebridge host could not look up the IP address for the Home Connect API. This is usually caused by transient internet loss, local router reboots, or network congestion. The plugin is designed to handle these interruptions and will automatically attempt to re-establish connection once the network is restored. If it occurs at a consistent time, check for scheduled tasks in your local network infrastructure.

#### Why do I get an `npm ERR! ENOTEMPTY` error when installing or updating the plugin?

<!-- INCLUDES: issue-53-9275 -->
This is an `npm` package manager error that occurs when a directory cannot be renamed or removed because it is not empty or a file is being held open. To resolve this: stop the Homebridge service, manually delete the temporary directory identified in the error log (e.g. `/usr/local/lib/node_modules/.homebridge-homeconnect-XXXXXXXX`), and then retry the installation. Restarting the host system often clears any remaining file locks.

#### Why can't I set the alarm timer or `AlarmClock` setting on my appliance?

<!-- INCLUDES: issue-77-7f97 -->
HomeKit does not currently define services or characteristics that match the semantics of a general-purpose appliance alarm timer. Mapping this to unrelated HomeKit services would cause incorrect behaviour and unreliable voice control via Siri. To maintain consistency with the HomeKit model, the plugin does not support setting the `BSH.Common.Setting.AlarmClock` timer.

#### What does the log message `Selected program ... is not supported by the Home Connect API` mean?

<!-- INCLUDES: issue-78-c9c7 -->
This is a cosmetic warning that occurs if an appliance reports a program selection before the plugin has finished loading the list of supported programs from the API. This typically happens during startup or after the cache is cleared. The plugin will automatically fetch the necessary details once the full program list is retrieved. This message does not indicate a failure and can be ignored if it only appears briefly during startup.

<!-- EXCLUDED: issue-3-b11b issue-3-e25e issue-5-7189 issue-10-f54e issue-13-d6c6 issue-17-9299 issue-21-4a0f issue-32-3eeb issue-36-116c issue-43-3166 issue-47-127f issue-65-324a issue-67-1639 issue-77-48d3 issue-77-ea0e issue-78-26c0 issue-80-1fb6 issue-84-bee9 issue-85-0a95 issue-89-ea9b issue-91-e7db issue-93-7521 issue-97-c838 -->
