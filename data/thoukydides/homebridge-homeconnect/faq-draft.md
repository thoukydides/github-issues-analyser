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

<!-- INCLUDES: issue-1-9917 issue-16-bbca issue-2-206a -->
If you see an error like `Request cannot be performed temporarily! due to local actuated user intervention [BSH.Common.Error.LockedByLocalControl]`, it means the appliance is currently being operated via its physical buttons or knobs. This is a restriction built into the appliance firmware and the Home Connect API; it cannot be bypassed by the plugin.

To prevent conflicting commands and ensure safety, the Home Connect API blocks all remote control while a user is physically interacting with the appliance. This lockout usually clears a few seconds after you stop touching the controls, although some appliances may maintain the lockout for a longer period during certain maintenance cycles or until a specific manual interaction is completed.

This plugin exposes the appliance's Local Control status via the `Program Mode` characteristic on the power `Switch` service. It is not shown in the Home app, but can be viewed or used to gate automations in third-party apps like *Eve*.

### Programs and Options

<!-- PARTITION -->

#### Why are some appliance features, programs, or options, missing?

<!-- INCLUDES: issue-1-3c2c issue-44-70cc issue-62-1f79 issue-67-1639 issue-75-7835 -->
The official Home Connect app (and some third-party integrations like IFTTT) use a **private API** with functionality not yet available to the public API used by this plugin.

Because the plugin dynamically queries the Home Connect API to determine capabilities, it can only expose what Bosch/Siemens allows third-party developers to see.

* **Verify Support:** Check the [Home Connect API Documentation](https://api-docs.home-connect.com) to see if a feature is officially supported.
* **Request Features:** If a feature is missing from the public API, you can [Contact Home Connect Developer Support](https://developer.home-connect.com/support/contact) to request its inclusion.

**Note:** If you see a log message stating the API returned **unrecognised keys/values**, please follow the provided link to report it on GitHub. This enables discovery and implementation of undocumented API features.

#### Why does the log say a selected program is not supported by the Home Connect API?

<!-- INCLUDES: issue-50-fe74 -->
Some appliances support programs that the public API can **monitor** but not **control**. This usually applies to:

* **Maintenance:** Rinsing cycles, drum cleaning, or descaling.
* **Favourites:** User-configured buttons on the physical machine.

The API does not allow the plugin to start these programs, but it does report when they are running. The plugin logs when programs are reported that were not advertised as supported during initialisation. This is normal behaviour and not a fault.

#### Why are all options missing for some programs?

<!-- INCLUDES: issue-17-eee1 issue-29-d8b2 issue-76-eaa5 -->
The plugin discovers available program and their options by querying the Home Connect API during Homebridge startup. This often fails if the appliance is:

* **Disconnected**: Powered off or not connected to Wi-Fi.
* **Busy**: Running a program or maintenance cycle.
* **Blocked**: Remote Control disabled, being controlled locally, or door open.
* **Low on Supplies**: Required consumables (e.g. water or coffee beans) low or missing.

The plugin attempts to resolve this automatically by repeating the discovery process when Homebridge is restarted, and updating its cache whenever the program is selected via other means. To manually trigger a rescan, ensure the appliance is switched on and ready, then use the HomeKit **Identify** function.

Notes:
* If only some options appear to be missing then that is likely to be due to an API limitation; not all appliance functionality is exposed via the public Home Connect API.
* Some appliances advertise support for programs that cannot be selected via the API (typically Sabbath or maintenance programs). Log messages about these programs can be safely ignored; they do not indicate a fault with the plugin.

#### Why does my appliance turn on automatically when Homebridge starts?

<!-- INCLUDES: issue-19-6db6 issue-20-4547 -->
To learn your model's specific options, the plugin must select each program via the API. For many appliances, **program options are only reported correctly when the power is on.**

At start-up, if the plugin does not have a valid cache, it will attempt to:

1. Turn the appliance on and wait for it to be ready.
2. Iterate through all available programs to record their options.
3. Restore the appliance to its initial state.

This should only happen **once**. If it happens on every restart, it means the discovery failed to finish (e.g. due to the appliance being manually operated or missing supplies) and is being retried.

#### Which settings are used for programs started without specific options?

<!-- INCLUDES: issue-46-2122 -->
If you start a program without custom options configured, the Home Connect server uses the **appliance defaults**. This is typically the factory default or the settings from the last time that program was run manually.

To see these default values, enable **Debug Logging** and use the **Identify** function. The plugin will output a detailed list of every default value currently reported by the API.

#### Why do my Oven programs only run for one minute?

<!-- INCLUDES: issue-55-d41a issue-70-5614 -->
This is a quirk of the Home Connect API. Unlike manual operation, any oven program started remotely **must** have a defined duration. If no duration is provided, the API uses a default value (usually 60 seconds).

To fix this, you must configure **Custom Program Switches** in the plugin settings and explicitly set a `Duration` (e.g. `3600` seconds for 1 hour). This ensures the oven remains on until you manually stop it or the timer expires.

#### 🚧 Why is there a delay when controlling appliances via HomeKit? 🚧

<!-- INCLUDES: issue-2-64eb -->
The Home Connect API is inherently slow, typically taking 1 to 2 seconds to complete a single request. Furthermore, Home Connect imposes strict rate limits, such as a maximum of 10 error-inducing requests or 5 program starts per minute. To ensure reliability and avoid being blocked, the plugin serialises multiple characteristic changes (for example, simultaneously turning on a light and adjusting its brightness) into sequential API calls. This results in a noticeable but necessary lag between the HomeKit command and the appliance's physical response.

#### 🚧 Why are my hood or dishwasher ambient light settings (colour/brightness) missing in HomeKit? 🚧

<!-- INCLUDES: issue-24-3f2d -->
Certain Home Connect appliances, particularly hoods and dishwashers, do not expose their full ambient light capabilities via the API unless the light is currently switched on. When the plugin first starts and discovers an appliance with no cache, it may only see basic on/off controls if the light is off.

To address this, the plugin (since v0.18.1) performs a discovery sequence during initial setup:
1. It temporarily switches the light on.
2. It reads the supported capabilities, such as `BSH.Common.Setting.AmbientLightBrightness` and `BSH.Common.Setting.AmbientLightCustomColor`.
3. It switches the light back to its previous state.

**Important technical notes on light control:**
- **Brightness Handling**: The API documentation states that brightness cannot be set independently if the colour is set to `CustomColor`. In this mode, the brightness is embedded within the custom colour value itself.
- **Discovery Constraints**: The `BSH.Common.Setting.AmbientLightCustomColor` setting is often only visible to the API if the `AmbientLightColor` is specifically set to `CustomColor`.
- **Cache Dependancy**: These capabilities are cached once successfully discovered. If you notice missing controls after a plugin update or after clearing your cache, ensuring the appliance is reachable and allow the plugin to complete its startup sequence usually resolves the issue.

#### 🚧 Why does my appliance suddenly report it "Does not support any programs" or show `SDK.Error.UnsupportedSetting`? 🚧

<!-- INCLUDES: issue-27-2626 -->
These errors typically indicate that the Home Connect API servers are experiencing instability or an outage. The plugin relies on the API to report appliance capabilities and state; if the API fails to return mandatory settings (such as `BSH.Common.Setting.PowerState`), the plugin cannot correctly initialise the accessory and may incorrectly report that no programs are supported.

To resolve this issue, follow these steps:
1. Check the logs for server-side error messages such as `502 Proxy Error`, `ESOCKETTIMEDOUT`, or `SDK.Error.HomeAppliance.Connection.Initialization.Failed`.
2. Wait for a few hours to allow the Home Connect service to stabilise.
3. Stop Homebridge.
4. Delete the plugin's persistent cache files (refer to the plugin wiki for the file locations).
5. Restart Homebridge.

If the error `SDK.Error.UnsupportedSetting` persists for universal settings like `BSH.Common.Setting.PowerState` even after clearing the cache, the issue is likely a backend fault with the Home Connect service itself. In such cases, you should report the issue to Home Connect developer support.

#### 🚧 Why can't I turn off my washing machine or dryer using the plugin? 🚧

<!-- INCLUDES: issue-3-9883 -->
The **Home Connect API** for specific appliances, including washers, dryers, and washer-dryers, only supports the `On` power state. These devices cannot be switched to `Off` or `Standby` via the public API. The plugin queries each appliance for its supported power states; if the logs indicate `Cannot be switched off`, it is a limitation of the hardware and the Home Connect platform itself rather than the plugin.

#### 🚧 Why does my oven report `Control scope has not been authorised` when starting a program? 🚧

<!-- INCLUDES: issue-30-450a -->
This error occurs because the Home Connect API requires specific authorisation scopes to control oven programs. While these permissions were previously restricted by Home Connect for independent developers, they were made available in March 2021. 

To resolve this, you must ensure you are using version `v0.20.0` or later of the plugin and refresh your authorisation scopes. If the error persists, you must force a re-authorisation by following these steps:
1. Stop Homebridge.
2. Locate the persistent storage directory for the plugin, typically found at `~/.homebridge/homebridge-homeconnect/persist/`.
3. Delete the cached token file (e.g. `94a08da1fecbb6e8b46990538c7b50b2`).
4. Restart Homebridge.
5. Follow the authorisation link provided in the Homebridge logs to sign in to Home Connect again. 

This refresh ensures the plugin requests the `Control` scope now permitted by the Home Connect API, enabling program control for ovens.

#### 🚧 Why does the log show `Too Many Requests` and a long wait time before the next API request? 🚧

<!-- INCLUDES: issue-39-aa6b -->
The Home Connect API enforces several rate limits, the most significant being a quota of **1000 requests per client and user account per day**. If this limit is exceeded, the API returns a `429 Too Many Requests` error and may block further activity for up to 24 hours.

Common reasons for hitting this limit include:
- **Unstable internet connection**: Frequent disconnections and reconnections force the plugin to re-authenticate and re-sync appliance states, consuming the request quota rapidly.
- **Initial Setup**: When the plugin first connects or adds new appliances, it must query for supported programmes, options, and settings, which involves many requests.
- **Heavy HomeKit Usage**: Frequent manual control or complex automations that trigger many state changes.
- **Home Connect Server Issues**: Transient problems on the manufacturer's side can occasionally cause retries that count against the quota.

The plugin is designed to handle this gracefully by identifying the lockout period and waiting for it to expire. Once the time has elapsed (e.g. `Waiting 86234 seconds`), the plugin will automatically re-establish the connection and resume normal operation. If the plugin does not recover after the wait period, restart Homebridge and check the logs with debug mode enabled (`-D` flag).

#### 🚧 Why does my appliance show as offline in Homebridge even though the Home Connect app works? 🚧

<!-- INCLUDES: issue-40-f8f5 -->
The Home Connect app can communicate with your appliances using two different methods: directly via your local Wi-Fi network or through the Home Connect cloud servers. In contrast, all third-party integrations, including this plugin, are restricted to using the official cloud API. If your appliance has a stable connection to your local network but is failing to connect to the Home Connect cloud servers, the official app will continue to function while the plugin will report `The appliance is offline`.

To verify the cloud connection status:
1. Open the Home Connect app.
2. Select your appliance and navigate to **Settings** > **Network**.
3. Ensure all three connection lines (Phone to Cloud, Cloud to Appliance, and Phone to Appliance) are green.

If the line between the Cloud and the Appliance is not green, follow the [Home Connect troubleshooting checklist](https://www.home-connect.com/global/help-support/set-up/faq) or contact their customer service. Note that transient cloud server issues can also cause this error; you can check for wider outages via unofficial monitors if the appliance was previously working correctly.

#### 🚧 Why is the ambient light on my dishwasher not supported by the plugin? 🚧

<!-- INCLUDES: issue-42-1683 -->
Although some dishwasher models feature physical ambient lighting, the Home Connect API currently only exposes control for ambient light on hood appliances. This is a limitation of the API provided by the manufacturer, not the plugin. Until Home Connect updates their API to include ambient light support for dishwashers, these features cannot be exposed to HomeKit.

#### 🚧 Why does the plugin report 'The appliance is offline' when the Home Connect app still works? 🚧

<!-- INCLUDES: issue-61-1c74 -->
If the plugin logs indicate `The appliance is offline`, it means the Home Connect cloud servers are reporting that they cannot communicate with your appliance. The official Home Connect mobile app can sometimes switch to direct local network communication when the cloud connection is unavailable, which is why it may appear to work while the plugin does not.

To troubleshoot this issue:
1. Check the [Home Connect Service Status](https://www.thouky.co.uk/homeconnect.html) to see if there are known outages or performance issues with the Home Connect API.
2. Test the official Home Connect app while your phone's Wi-Fi is turned off. This forces the app to connect via the cloud servers rather than your local network. If it fails to control the appliance over cellular data, the issue is with the appliance's cloud connection or the servers themselves.
3. In the official Home Connect app, navigate to the appliance's settings and find the **Network** section. Verify that all three connection stages (appliance-app, appliance-cloud, and app-cloud) are reported as healthy.
4. Power cycle the appliance or restart your router to refresh the connection to the Home Connect servers.

In many cases, these connection issues are transient and will resolve themselves without intervention once the Home Connect cloud stabilises.

#### 🚧 Why is my Homebridge log filling up with `[Oven]` `Event STATUS` temperature messages? 🚧

<!-- INCLUDES: issue-64-694f -->
These messages are generated whenever the Home Connect servers report a change in the appliance's internal temperature. Most ovens do not truly turn off; they remain in a standby state where they continue to monitor and report temperature data to the cloud. This is especially noticeable as an oven cools down after use.

Several factors can increase the frequency of these logs:
1. Temperature units: Settings using Fahrenheit (`°F`) will report changes almost twice as frequently as those using Celsius (`°C`) due to the higher sensitivity of the scale.
2. Environmental factors: Fluctuations caused by the oven door being left open or unreliable hardware sensors.

The plugin is designed to log all information reported by the Home Connect API, and there is currently no configuration option to disable specific appliances or filter these status events. To prevent these messages from cluttering your logs, it is recommended to run the plugin in a separate Homebridge child bridge or a dedicated Homebridge instance. This isolates the plugin's output and ensures that high-volume events do not obscure logs from other accessories.

#### 🚧 Why does my dishwasher trigger a Program Finished event when it reconnects? 🚧

<!-- INCLUDES: issue-66-f64f -->
The `homebridge-homeconnect` plugin maps events from the Home Connect API directly to HomeKit triggers. When the plugin logs `Event Program Finished`, it is because the appliance or the Home Connect cloud servers have sent a `BSH.Common.Event.ProgramFinished` event with the state `Present`.

Some appliances, particularly certain Bosch dishwasher models, appear to re-broadcast this event when re-establishing a connection to the cloud after being disconnected. Since the plugin does not filter or state-check these events, they are passed through to HomeKit as a button press or notification. This is a quirk of the appliance firmware or the Home Connect API's event handling rather than a defect in the plugin itself.

#### 🚧 Why does my Bosch washer or dryer always show as ON in the Home app even when it is finished? 🚧

<!-- INCLUDES: issue-72-52a3 -->
Many Home Connect appliances, particularly washing machines and dryers, are designed as always-on devices from the perspective of the Home Connect API. On these models, the `BSH.Common.Setting.PowerState` only supports the value `On`. The plugin handles this by mapping the appliance's network connection status to the HomeKit Power switch:

1.  **Connected state**: When the appliance is connected to the Home Connect servers, the HomeKit switch is shown as **On**.
2.  **Disconnected state**: When the appliance is physically switched off or loses its Wi-Fi connection, the API reports a `DISCONNECTED` event. The plugin then sets the HomeKit switch to **Off**.

In some cases, if an appliance is already offline when Homebridge starts, the plugin may require a few moments to sync this status from the appliance discovery list. This behaviour was significantly improved in version `v0.23.6` to ensure the initial power state correctly reflects the connection status reported by the API during startup. If you are seeing persistent issues with the power state not updating, ensure you are running the latest version of the plugin.

#### 🚧 Why does Homebridge startup seem to stall when my appliance is offline? 🚧

<!-- INCLUDES: issue-72-9eb7 -->
When the plugin starts, it must identify the capabilities and settings of each registered appliance to correctly initialise the corresponding HomeKit services. 

*   **Cahcing**: To avoid exceeding API rate limits, the plugin caches these capabilities. If the cache is valid and recent, the plugin will use it to restore the accessory even if the appliance is currently offline.
*   **Cache Expiry**: If the cache has expired (due to being too old or a fresh installation), the plugin must query the appliance directly. If the appliance is offline, this specific part of the initialisation process will stall until the appliance connects to the Home Connect servers.
*   **Impact**: While stalled waiting for capabilities, the Power switch might appear as read-only in HomeKit or use a generic state until the first successful communication with the appliance allows the plugin to determine exactly what features (like standby vs. off) the hardware supports.

#### 🚧 Why am I seeing `Home Connect subsystem not available` or `503` errors in the logs? 🚧

<!-- INCLUDES: issue-73-03ca -->
The error `Home Connect API error: Home Connect subsystem not available. Please try it again. [503]` indicates a server-side issue with the Home Connect infrastructure. This is not a fault with the plugin or your local configuration.

When this happens:
* The official Home Connect mobile application may also fail to start or connect to appliances.
* The issue is typically transient and usually resolved by the Home Connect team within a few hours or days.
* Re-generating Client IDs or re-authenticating will not resolve the issue while the servers are down.

You can check the official Home Connect system status, although please note that it may occasionally report the system as functional even during localized outages. If the problem persists for an extended period, you may wish to contact Home Connect support directly.

#### 🚧 Why does the power switch for my appliance result in an error like `SDK.Error.InvalidSettingState` when I try to turn it off? 🚧

<!-- INCLUDES: issue-83-53f1 -->
The error `BSH.Common.Setting.PowerState currently not available or writable [SDK.Error.InvalidSettingState]` typically occurs because of an inconsistency in the Home Connect API. The plugin creates a HomeKit `Switch` service for appliances and determines if it should be interactive (read/write) or informational (read-only) based on the capabilities reported by the Home Connect servers.

In some cases, the Home Connect API incorrectly reports that an appliance supports being switched to `Off` or `Standby` when it actually does not. This is particularly common with:

*   **Cooling appliances (Fridges/Freezers):** These should technically always be `On`, but the API sometimes incorrectly lists `Off` or `MainsOff` as supported values.
*   **Hobs (Cooktops):** The API may claim power control is supported, but it is often restricted for safety reasons or pending firmware updates from the manufacturer.

When the plugin sees these supported states in the API metadata, it enables the switch in HomeKit. However, when you attempt to toggle it, the Home Connect server rejects the command because the state is not actually writable for that specific model or firmware version.

This is a limitation of the Home Connect API implementation for specific hardware and cannot be fixed within the plugin. The plugin trusts the metadata provided by the API to ensure compatibility with future hardware updates without requiring manual overrides for every model.

#### 🚧 Why does the authorisation fail with an `invalid_request` or `invalid content type` error? 🚧

<!-- INCLUDES: issue-86-3b75 -->
These errors are returned by the Home Connect API when an authorisation request is malformed or uses invalid credentials. If you encounter this during initial setup, check the following:

1.  **Client ID Format**: The `clientid` in your `config.json` must be exactly 64 hexadecimal characters (digits `0`-`9` and letters `A`-`F`). Ensure no extra spaces, quotes, or hidden characters were included when copying the ID from the developer portal.
2.  **Production vs. Simulator Credentials**: The default "API Web Client" credentials provided in the Home Connect Developer portal are for the appliance simulator only. If you are connecting physical appliances, you must create a new application in the developer portal to obtain a production Client ID. If you are intentionally using the simulator, ensure `

#### 🚧 Why can I see the power status of my oven but not control it via HomeKit? 🚧

<!-- INCLUDES: issue-99-fe79 -->
This behaviour occurs when the Home Connect API incorrectly reports that an appliance supports both `Off` and `Standby` power states. According to the Home Connect API specification, an appliance should support `On` and only one of either `Off` or `Standby`.

When the plugin detects this contradictory information in the device constraints, it logs a message: `[Appliance Name] Claims can be both switched off and placed in standby; treating as cannot be switched off`. To avoid sending invalid commands that could result in API errors or temporary rate-limiting of your account, the plugin treats the power state as read-only until the API returns valid data.

This is an issue with the appliance firmware or the Home Connect cloud API, rather than the plugin itself. Control functionality will typically resume automatically once Home Connect corrects the device constraints for your specific model.

For clarity, the plugin handles different switch types as follows:
* **Power switch**: Sets the `Off` or `Standby` state only if the API constraints are valid.
* **Active program switch**: Turning this off will *Pause* the program (if supported by the appliance and firmware) or *Stop* the program.
* **Specific program switch**: If configured to *Start* a program, turning it off *Stops* the active program. If configured to *Select* only, turning it off has no effect.

### Error Messages

## HomeKit Services

### Notifications & Events

<!-- PARTITION -->

#### Why does my appliance appear as `Stateless Programmable Switch` buttons?

<!-- INCLUDES: issue-1-38d2 issue-3-c53c issue-43-caee issue-45-fb59 -->
Home Connect communicates many appliance states as **transient events** (e.g. "Drip tray full" or "iDos fill level poor") rather than persistent, queryable states. It is not possible for the plugin to poll the current state (e.g. after a reboot), and many appliances do not reliably generate events when a condition clears.

These events map to `Stateless Programmable Switch` services, allowing them to be used as automation triggers. Other types like `Contact Sensor` are not used because they require a persistent state that cannot be determined reliably, leading to a poor user experience.

The Apple Home app only displays numeric labels (Button 1, Button 2). To see what these represent, check your **Homebridge logs** during startup or use a third-party app like **Eve** or **Home+** which displays the descriptive labels.

#### Why does the Home app show two (or more) tiles for one appliance?

<!-- INCLUDES: issue-59-593e -->
This is standard Apple Home behaviour. To keep the interface organized, Apple separates different service types into distinct tiles. Specifically, a separate tile is created for the `Stateless Programmable Switch` services used for event triggers.

While you can toggle **Show as Separate Tiles**, Apple does not currently allow these buttons to be merged into the primary appliance tile. If you do not use these events for automations, you can disable them in the plugin configuration to prevent them from appearing in the Home app.

#### How do I get appliance notifications?

<!-- INCLUDES: issue-38-9780 issue-63-11e1 -->
Apple Home only supports native push notifications for specific security-related sensors (Doors, Locks, Smoke, etc.). Most Home Connect events do not fit these categories; forcing them to do so would result in misleading notification text.

To receive notifications for other events, you have two main options:

* **The Official Home Connect App:** The most reliable way to get detailed, text-based push notifications.
* **HomeKit Automations:** Trigger an action via a `Stateless Programmable Switch`. You can generate a HomeKit notification indirectly by having the automation toggle a [homebridge-dummy](https://github.com/mpatfield/homebridge-dummy) Contact Sensor, which *does* support native alerts.

#### 🚧 Why does my Siemens coffee maker still show as On in HomeKit after it enters auto-standby? 🚧

<!-- INCLUDES: issue-35-2eee -->
Some coffee makers, particularly certain Siemens models like the TI95 series, do not reliably emit a `PowerState` change event through the Home Connect API when they automatically transition to standby mode after a period of inactivity. This results in the HomeKit power switch remaining in the **On** position even though the appliance is inactive.

The plugin includes a workaround for this behaviour by monitoring the `BSH.Common.Status.OperationState`. When the appliance reports that it has become `Inactive`, the plugin infers that the power has been switched off or moved to standby. 

This logic was implemented in version `v0.18.3`. If you are encountering this issue, please ensure:
1. You are running the latest version of the plugin.
2. You have not disabled status updates in your configuration.

Note that the plugin does not distinguish between the `Off` and `Standby` states for the purposes of the HomeKit power switch; both are treated as **Off**.

#### 🚧 Can I see the remaining time of an appliance programme in HomeKit? 🚧

<!-- INCLUDES: issue-48-237c -->
Yes, the remaining duration is available, but there are limitations on how it is displayed within HomeKit apps:

1. The remaining time is exposed via the `RemainingTime` characteristic on the main `Active Program` switch service.
2. Apple's Home app generally only displays the `Remaining Duration` characteristic for specific accessory types defined in the HomeKit Accessory Protocol (HAP) specification, such as `Irrigation System` and `Valve` accessories. As appliances do not fall into these categories, the value will not be visible in the native Home app.
3. To view the remaining time or use it to trigger automations, you must use a third-party HomeKit app (such as Controller for HomeKit or Eve) that supports displaying non-standard characteristics for appliance services.

For more details on which characteristics are mapped to HomeKit, refer to the plugin's documentation on HomeKit mapping and recommended third-party apps.

#### 🚧 How can I reduce the number of switches created for appliance programs? 🚧

<!-- INCLUDES: issue-49-3c91 -->
By default, the plugin creates individual switches for every supported program of an appliance. For devices with many cycles, such as washers or dryers, this can result in dozens of switches cluttering the HomeKit interface. 

To hide these switches and simplify the interface:
1. Access the plugin configuration via `homebridge-config-ui-x`.
2. Locate the settings for the specific appliance or the global plugin settings.
3. Enable the option **No individual program switches**.

This configuration suppresses the individual cycle switches while maintaining core functionality such as status monitoring, timers, and power controls. This is often preferred as program switches are typically only functional when the appliance is in a specific state (e.g. powered on but not yet running).

#### 🚧 Why are the power switch and program switches for my appliance in a random order in HomeKit? 🚧

<!-- INCLUDES: issue-7-36fe -->
The HomeKit Accessory Protocol (HAP) does not provide a robust or well-defined way for plugins to enforce the display order of multiple services within a single accessory. While the plugin exposes several services (such as the power `Switch` and various program control `Switch` services), individual HomeKit apps determine how to order them. Attempts to use HAP features like **Primary** or **Linked** services have not consistently improved ordering across different applications; in some cases, these changes actually made the Apple **Home** app's ordering less predictable. Most third-party HomeKit apps, such as **Eve**, **Home+**, and **Hesperus**, allow users to manually reorder services or characteristics for an accessory within their own interfaces. If you require a specific order, it is recommended to use the manual reordering features provided by these third-party apps.

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

#### 🚧 Why are there no log entries for several hours even though the plugin is running? 🚧

<!-- INCLUDES: issue-13-159f -->
If no appliances are being used and no status changes are occurring, it is normal for the plugin to remain silent in the logs. By default, log entries are only generated when an appliance is controlled via HomeKit, the Home Connect event stream reports a change in appliance state, or a connection error occurs. When running with debug logging (`-D`) enabled, the plugin polls the appliance list approximately once per hour, but otherwise remains quiet unless there is activity. The absence of log updates does not indicate that the plugin or Homebridge has frozen.

#### 🚧 What does a `Proxy Error` in the logs mean? 🚧

<!-- INCLUDES: issue-13-daa9 -->
A `Proxy Error` indicates that the Home Connect API servers unexpectedly terminated the event stream. This is a server-side issue within the Home Connect infrastructure and is not caused by the plugin. The plugin is designed to handle these interruptions by automatically attempting to re-establish the connection. If these errors occur frequently, it usually indicates transient instability in the Home Connect cloud service.

#### 🚧 Why does the log show `The appliance is offline` when the device is connected in the Home Connect app? 🚧

<!-- INCLUDES: issue-15-25d9 -->
The `The appliance is offline` message indicates that the plugin has lost its connection to the Home Connect **Event Stream** or failed to synchronise the appliance's state. The plugin relies on this persistent stream for real-time updates; if it is interrupted, the appliance is flagged as offline to prevent operations based on outdated information. This status specifically refers to the API's event-based connection rather than the appliance's local Wi-Fi status. It is possible for an appliance to appear functional in the official Home Connect app (which can use alternative communication methods) while being reported as offline in Homebridge if the event stream is unavailable. Ensure your network allows persistent outgoing connections and check for any Home Connect service interruptions.

#### 🚧 Why do I see an `InvalidStepSize` or `SDK.Error.InvalidOptionValue` error when configuring programs? 🚧

<!-- INCLUDES: issue-18-1fff -->
The Home Connect API requires that values for certain program options, such as `FillQuantity` for coffee makers or `StartInRelative` for various appliances, must be exact multiples of a specific step size. If a value is provided that does not align with these increments, the API will return an error such as `Home Connect API error: ... validation failed with InvalidStepSize. [SDK.Error.InvalidOptionValue]`. The plugin attempts to mitigate this in the Homebridge configuration UI by providing dropdown menus for options with fewer than 20 permitted values, or by adding the required step size to the field description for larger ranges. When entering values, ensure they are multiples of the required step size. Using the up/down arrows in the Homebridge UI should typically snap the value to the correct increment.

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

### New partition 2

<!-- PARTITION: New partition 2 -->

#### 🚧 Why does the Homebridge UI state "This appliance does not support any programs"? 🚧

<!-- INCLUDES: issue-42-9162 -->
This message is displayed when the plugin is unable to retrieve a list of supported programs from the Home Connect API. This is typically caused by transient instability or temporary outages of the Home Connect servers. If you encounter this error: 1. Verify the status of the Home Connect API. 2. Restart Homebridge to trigger a new request for the appliance configuration. 3. Ensure the appliance is connected to Wi-Fi and reachable in the official Home Connect app. In most instances, this issue resolves itself once the API servers are responding correctly.

#### 🚧 Why does the log show a program running or time remaining when my appliance is off? 🚧

<!-- INCLUDES: issue-5-4389 -->
The plugin logs and displays status information exactly as it is received from the **Home Connect API** server. If the logs indicate that a program is active or showing a countdown (e.g. `Program 1858 seconds remaining`) while the appliance is physically off, it means the Home Connect server is out of sync with the hardware. You can try to resolve this by starting and then stopping a manual program using the official Home Connect app to reset the server state. If the issue persists, it may require re-registering your **Client ID** or contacting Home Connect support, as the plugin cannot correct invalid data sent by the API.

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

#### 🚧 Why does the log show `request rejected by client authorization authority (developer portal)`? 🚧

<!-- INCLUDES: issue-82-05c8 -->
This error is returned directly by the Home Connect servers when the provided `Client ID` is not recognised. This is typically caused by one of the following:

1. **Incorrect ID type**: Ensure you have copied the 64-character hexadecimal string labelled `Client ID`. Do **not** use the `Client Secret` or the ID associated with the `API Web Client`.
2. **Propagation delay**: New applications created in the Home Connect Developer Portal are not always active immediately. It can take several minutes or even an hour for the new `Client ID` to propagate to the production authorisation servers. If the ID is definitely correct, wait a short while and restart Homebridge.
3. **Truncated ID**: Double-check that the entire string was copied without missing characters at the beginning or end.

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

<!-- EXCLUDED: issue-10-f54e issue-13-d6c6 issue-17-9299 issue-21-4a0f issue-3-b11b issue-3-e25e issue-32-3eeb issue-36-116c issue-43-3166 issue-47-127f issue-5-7189 issue-65-324a issue-67-1639 issue-77-48d3 issue-77-ea0e issue-78-26c0 issue-80-1fb6 issue-84-bee9 issue-85-0a95 issue-89-ea9b issue-91-e7db issue-93-7521 issue-97-c838 -->
