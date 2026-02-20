# Frequently Asked Questions (FAQ)

## Home Connect

### Local/Remote Control

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

#### Why does my oven report `Control scope has not been authorised`?

<!-- INCLUDES: issue-30-450a -->
This error occurs because the Home Connect API requires specific authorisation scopes to control oven programs. While these were previously restricted, they were made available to independent developers in March 2021. If you authorised the plugin's connection to Home Connect prior to this then force a re-authorisation:
1. Stop Homebridge.
2. Delete the cached token file in the plugin's persistent storage directory (usually `~/.homebridge/homebridge-homeconnect/persist/94a08da1fecbb6e8b46990538c7b50b2`).
3. Restart Homebridge.
4. Follow the authorisation link provided in the logs or Homebridge UI to sign in again.

#### Why is there a delay when controlling appliances via HomeKit?

<!-- INCLUDES: issue-2-64eb -->
The Home Connect API is inherently slow, typically taking 1 to 2 seconds to complete a single request. Furthermore, Home Connect imposes strict rate limits, such as a maximum of 5 program starts per minute. To ensure reliability and avoid being blocked, the plugin serialises multiple characteristic changes (e.g. simultaneously turning on a light and adjusting brightness) into sequential API calls. Additional delays are inserted if the API indicates that a rate limit has been exceeded. This results in a noticeable but necessary lag between the HomeKit command and the appliance's physical response.

#### Why does the log show `Too Many Requests` and a long wait time?

<!-- INCLUDES: issue-39-aa6b -->
The Home Connect API enforces strict [rate limiting](https://api-docs.home-connect.com/general/#rate-limiting). Exceeding any of these limits triggers a `429 Too Many Requests` error and a lockout for up to 24 hours. Common causes include unstable internet (forcing frequent re-syncs), heavy automation usage, or many appliances being added at once.

The plugin handles this by identifying the lockout period and waiting for it to expire (e.g. `Waiting 5 hours 23 minutes before issuing Home Connect API request`). It will automatically resume operation once the time has elapsed. If it does not recover, restart Homebridge and check the logs in debug mode.

#### Why does my appliance fail to start when using the switch in the Home app?

<!-- INCLUDES: issue-149-a6ae -->
For most appliances this plugin exposes multiple `Switch` services to HomeKit, including:

* **Power**: Controls the standby state of the machine.
* **Active Program**: Starts or stops the currently selected program.
* **Individual Programs**: Start (or select) a specific named program.
* **Modes**: Any settings that the appliance supports, such as `SabbathMode` or `SuperModeFreezer`.

By default, the Apple Home app may group these separate services into a single tile. Toggling this combined tile attempts to activate all switches simultaneously, which results in conflicting requests. The plugin attempts to detect and ignore such invalid actions.

To resolve this, you should configure the Home app to display these services individually using the Home app's **Show as Separate Tiles** option. You will then be able to control the switches individually.

### Programs and Options

#### Why does the log show `Unrecognised`, `Unexpected`, or `Mismatched` fields and types?

Common scenarios include:
* **Undocumented Fields**: Newer appliances or regional variations often report features that haven't been previously mapped.
* **Type Mismatches**: Some models, particularly refrigeration, may report statuses (like door states) using identifiers that differ from the standard API specification.
* **API Key Inconsistencies**: There are known cases where the API uses keys slightly different from its own documentation, such as `LaundryCare.Washer.Option.IDos1.Active` (with an extra period) instead of the documented version.

Although these appear as warnings, they are generally **non-critical** and do not affect basic functionality. If the logs state that the API returned unrecognised keys/values, please use the GitHub link provided in the log to report them. This allows the maintainer to update the plugin's internal registry and add support for these features.

#### Why are some appliance features, programs, or options missing?

<!-- INCLUDES: issue-1-3c2c issue-3-9883 issue-4-f130 issue-42-1683 issue-44-70cc issue-62-1f79 issue-67-1639 issue-75-7835 issue-94-e55f issue-122-9466 issue-157-61a1 -->
There are three primary reasons why features may be missing from the plugin:

1. **Private API Limitations**: The official Home Connect app and certain partners (like IFTTT) use a private API with functionality not available to third-party developers. If a feature is missing from the [official public API documentation](https://api-docs.home-connect.com), the plugin cannot access it.
2. **Experimental Support**: Support for some device types (such as hoods) is implemented based on documentation without access to physical hardware. Some features may be experimental or untested; providing debug logs via a GitHub issue can help refine these implementations.
3. **Manufacturer Constraints**: Manufacturers may choose not to expose specific features to the public API for safety or marketing reasons. You can contact [Home Connect Developer Support](https://developer.home-connect.com/support/contact) to request the inclusion of missing features in the public API.

#### Why does the log say a selected program is not supported by the Home Connect API?

<!-- INCLUDES: issue-50-fe74 issue-78-c9c7 -->
This warning typically occurs in two different contexts:

* **Monitor-Only Programs**: Some appliances support cycles (such as rinsing, drum cleaning, or descaling) and user-configured **Favourites** that the API allows the plugin to monitor but not control remotely. The plugin logs these when they are detected but cannot be started via HomeKit.
* **Startup Timing**: You may see a transient warning during Homebridge startup or after clearing the cache. This happens if an appliance reports a program selection event before the plugin has finished loading the full list of supported programs from the API. The plugin will automatically fetch the necessary details once initialisation is complete.

In both cases, these messages are often cosmetic and do not indicate a functional failure.

#### Why are all options missing, or why is an appliance showing as `Not Responding`?

<!-- INCLUDES: issue-17-eee1 issue-26-a87b issue-29-d8b2 issue-42-9162 issue-54-f83f issue-76-eaa5 issue-186-ee7e -->
The plugin discovers appliance capabilities during startup and caches them. This process can fail if the appliance is powered off, disconnected from Wi-Fi, busy, has an open door, or is low on supplies. Technical issues such as Home Connect API instability or temporary outages can also cause the message `This appliance does not support any programs`.

To resolve these issues and refresh the appliance metadata:

1. Ensure the appliance is switched on, connected, and not in use.
2. Use the HomeKit **Identify** function (found in accessory settings) to trigger a rescan of supported programs and options.
3. If the issue persists (e.g. ambient light colour controls remain missing), you may need to clear the persistent cache. Stop Homebridge and navigate to `~/.homebridge/homebridge-homeconnect/persist`. Delete the files corresponding to your appliance (the filenames are MD5 hashes). **Do not delete** the file starting with `94a08da1...` as this contains your account authorisation.
4. Restart Homebridge to force a fresh discovery.

#### Why do I see an `InvalidStepSize` or `SDK.Error.InvalidOptionValue` error?

<!-- INCLUDES: issue-18-1fff -->
The Home Connect API requires that certain values, such as `FillQuantity` for coffee machines or `StartInRelative` timers, follow strict increments. If a value is provided that is not an exact multiple of the required step size, the API will return a validation error.

The plugin attempts to mitigate this by providing dropdown menus or adding the required step size to the field description in the Homebridge UI. When manually entering values, ensure they align with the increments specified in the configuration interface. Using the up/down arrows in the Homebridge UI will typically snap the value to the correct step.

#### Why are Pause and Resume features missing or inconsistent?

<!-- INCLUDES: issue-8-226b issue-8-5b9e -->
Experimental support for pausing and resuming programs is implemented via the HomeKit `Active` characteristic, but there are several limitations:

* **App Support**: Apple's native Home app does not display the pause/resume controls for most appliance types. You must use a third-party app like **Eve for HomeKit** or **Home+** to access these functions.
* **API Inconsistency**: Support for these commands varies significantly between firmware versions. Many appliances (including various ovens and dishwashers) do not support `PauseProgram` via the public API despite documentation suggesting otherwise. Others, like certain Siemens washers, may support pausing but not resuming.

The plugin dynamically detects supported commands for each specific appliance. If the options do not appear in a compatible third-party app, it indicates your hardware or firmware does not support the feature via the public API.

#### How can I trigger the Identify function in the Eve app?

<!-- INCLUDES: issue-37-b6a0 -->
To trigger the `Identify` mechanism within the Eve app:

1. Navigate to the **Rooms** tab and locate the appliance.
2. Tap the name of the appliance to open the detailed view (do not tap a toggle or slider).
3. Tap the appliance name or the small arrow at the top of the screen, just below the **Edit** button.
4. Tap the **ID** button that appears next to the settings cog.

This will trigger the identification sequence on the physical appliance and force the plugin to refresh its cached data.

#### How can I enable dishwasher options like `half load` or `extra dry` in HomeKit?

<!-- INCLUDES: issue-138-eb88 -->
Home Connect distinguishes between global **settings** (like Child Lock) and program-specific **options** (like `half load`).

The plugin provides HomeKit services for settings that apply globally. However, program options are only relevant when a specific cycle is selected. By default, the plugin creates a HomeKit `Switch` for each program using its default settings. To use specific options, you must configure a **Custom list of programs and options** in the plugin settings and explicitly define the options for each switch.

#### Why does my appliance turn on automatically or Homebridge startup stall?

<!-- INCLUDES: issue-19-6db6 issue-20-4547 issue-72-9eb7 -->
To learn an appliance's specific options, the plugin must select each program via the API. Many appliances only report these options correctly when the power is on.

If the plugin does not have a valid cache, it will attempt to turn the appliance on, iterate through all available programs, and then restore the appliance to its original state. This should only happen **once**. If it occurs every time Homebridge restarts, it suggests the discovery process was interrupted (e.g. by manual operation or the appliance being offline) and is retrying. If no cache exists and the appliance is offline, startup will stall until a connection is established.

#### Which settings are used for programs started without specific options?

<!-- INCLUDES: issue-46-2122 -->
If a program is started without custom options, the Home Connect server uses the **appliance defaults**. These are usually the factory defaults or the settings used the last time that program was run manually.

To view these default values, enable **Debug Logging** and use the **Identify** function. The plugin will output a detailed list of every default value currently reported by the API to the Homebridge log.

#### Why do my oven programs only run for one minute?

<!-- INCLUDES: issue-55-d41a issue-70-5614 -->
When started remotely via the API, oven programs **must** have a defined duration. If no duration is provided by the plugin, the Home Connect API defaults to a value of 60 seconds.

To resolve this, use the **Custom list of programs and options** in the plugin settings to explicitly set a `Duration` (for example, `3600` seconds) for your oven switches. This ensures the oven remains on until the timer expires or you manually stop it.

#### How can I reduce the number of switches created for appliance programs?

<!-- INCLUDES: issue-49-3c91 -->
By default, the plugin creates individual switches for every supported program, which can clutter HomeKit for appliances with many cycles (like washing machines). To simplify the interface:

* **Hide all program switches**: In the plugin settings for the specific appliance, enable the **No individual program switches** option. This keeps power and status controls but removes the cycle switches.
* **Filter switches**: Use the **Custom list of programs and options** setting to specify exactly which programs you want to appear in HomeKit.

### Appliance Status

#### Why does my appliance status (like door state) appear stuck in HomeKit?

A status of `The appliance is offline` indicates that the plugin has lost its connection to this event stream or failed to synchronise state, even if the appliance remains connected to your local Wi-Fi. The API sends a `KEEP-ALIVE` event approximately every 55 seconds; if the plugin detects no activity for 120 seconds, it will automatically re-establish the stream (often logged as `ESOCKETTIMEDOUT`). In some cases, the connection may remain technically active while the Home Connect backend stops distributing actual state change events.

To troubleshoot:
1. Enable the **Log Debug as Info** plugin option to see all raw events received from the API. If no events are logged when you interact with the appliance, the issue resides with the Home Connect platform.
2. Restart Homebridge to force the plugin to subscribe to a fresh event stream.
3. Ensure your network configuration does not prematurely terminate long-lived TCP connections; the default TCP idle timeout on many routers is 300 seconds.

#### Why is my appliance unresponsive in Homebridge but working in the Home Connect app?

<!-- INCLUDES: issue-71-a9f3 -->
The official Home Connect mobile app can communicate with appliances via the local Wi-Fi network when your phone is on the same network. In contrast, this plugin and all third-party integrations must use the public Home Connect cloud API. It is possible for an appliance to have a working local connection but a stalled cloud connection.

To diagnose this, disable Wi-Fi on your mobile device to force the Home Connect app to use a cellular (remote) connection. If the appliance becomes unresponsive in the app while on cellular data, the issue lies with the appliance's connection to the Home Connect servers rather than the plugin. You can often resolve this by navigating to the appliance's **Settings** in the official app, selecting **Network**, and toggling the **Connection to server** setting off and then back on to force a reconnection to the cloud API.

#### Why do my appliances remain visible in the Home app when they are turned off or offline?

<!-- INCLUDES: issue-52-2dc8 -->
The plugin synchronises accessories based on the list of appliances registered to your Home Connect account. As long as an appliance is associated with your account in the Home Connect API, it will persist in HomeKit. Being unreachable or powered off does not trigger the removal of the accessory from HomeKit. 

If you observe inconsistent behaviour, such as devices unexpectedly appearing or disappearing, this may be due to a synchronisation issue within HomeKit or the Homebridge cache. This can often be resolved by removing the bridge from the Home app, clearing the Homebridge cache files, and then re-adding the bridge.

#### Why does the log show a program running or time remaining when my appliance is off?

<!-- INCLUDES: issue-5-4389 -->
The plugin logs and displays status information exactly as it is received from the Home Connect API server. If the logs indicate that a program is active or showing a countdown while the appliance is physically off, it means the Home Connect server is out of sync with the hardware.

To resolve this, try starting and then stopping a manual program using the official Home Connect app to reset the server state. This is typically a transient server-side issue and cannot be corrected by the plugin itself.

#### Why does my dishwasher trigger a Program Finished event when it reconnects?

<!-- INCLUDES: issue-66-f64f -->
Some Bosch dishwasher models appear to re-broadcast the `BSH.Common.Event.ProgramFinished` event when re-establishing a connection to the Home Connect cloud after being offline. The plugin maps events from the API directly to HomeKit triggers; therefore, these re-broadcasts are passed through as button presses or notifications. This is a quirk of the appliance firmware or API event handling rather than a defect in the plugin itself.

#### Why is my Homebridge log filling up with oven `Event STATUS` temperature messages?

<!-- INCLUDES: issue-64-694f -->
These events are generated whenever the Home Connect servers report a change in the appliance's internal temperature. Most ovens remain in a standby state after use where they continue to monitor and report cooling progress.

The plugin logs all status information reported by the API. To prevent these messages from cluttering your main logs, it is recommended to run the plugin in a separate Homebridge **Child Bridge**. This isolates the plugin's output and ensures that high-volume events do not obscure logs from other plugins.

### Home Connect Errors

#### Why does my appliance show a `409 Conflict` error?

<!-- INCLUDES: issue-1-e985 issue-22-3aca issue-40-f8f5 issue-61-1c74 issue-83-53f1 issue-99-fe79 issue-113-d74c issue-155-6e9f issue-186-6cfd -->
The Home Connect API uses `409 Conflict` errors for a wide variety of failures that result in a request being rejected. The error message usually provides more details of the specific reason. Some of the more common cases are:

* `SDK.Error.HomeAppliance.Connection.Initialization.Failed`: This indicates that the appliance is not connected to the Home Connect cloud servers. Note that the official Home Connect app may still function by communicating directly via your local Wi-Fi network, whereas this plugin is restricted to using the official cloud API. To troubleshoot:
  1. In the official app, navigate to the appliance's **Settings** > **Network** and ensure all three connection stages (appliance-app, appliance-cloud, and app-cloud) are green.
  2. Test the official app while your phone's Wi-Fi is disabled; if it fails to control the appliance over cellular data, the issue is with the appliance's cloud connection.
  3. Power cycle the appliance or restart your router to refresh the connection to the Home Connect servers.
  4. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for outages.

* `SDK.Error.InvalidSettingState`: This occurs when a setting is currently read-only or unavailable. It is often caused by inconsistencies in the API regarding power state capabilities (common with fridges, freezers, and hobs). On other appliances, like coffee machines, it frequently indicates a maintenance message is displayed on the physical screen (e.g. "Change water filter" or "Descaling required") that requires manual confirmation before remote control can resume.

* `SDK.Error.ProgramNotAvailable`: This is returned when you attempt to start a program that the API considers unavailable for remote execution. This may be due to appliance settings, safety features (e.g. local control active), or firmware bugs. You can verify which programs the API allows by enabling the `Log API Bodies` debug option and checking the response to the `GET /api/homeappliances/.../programs/available` request in the logs.

For details of other `409` errors refer to the [Home Connect API Errors](https://api-docs.home-connect.com/general/#api-errors) documentation.

#### Why does the power button not work or return a `BSH.Common.Error.WriteRequest.Busy` error?

<!-- INCLUDES: issue-112-6c3a issue-116-1125 -->
The `Busy` error is returned by the Home Connect cloud when an appliance cannot process a command, often because it requires physical interaction (e.g. filling a water tank or closing a door). If you encounter this error, check the physical display of the appliance or the official Home Connect app to see if a manual action is required. This issue may also be caused by a transient issue with the Home Connect cloud service itself; check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

Failure to power certain ovens on or off is a known bug in the Home Connect API affecting specific models. If the appliance is physically ready but the power command is rejected, this is an external platform limitation. You should report such issues to [Home Connect Developer Support](https://developer.home-connect.com/support/contact) with your appliance's E-Nr (part number).

#### What do `Gateway Timeout` or `Proxy Error` messages in the log mean?

<!-- INCLUDES: issue-11-d4f5 issue-13-daa9 issue-19-6154 -->
Errors such as `SDK.Error.504.GatewayTimeout` or `Proxy Error` indicate that the Home Connect cloud servers are experiencing internal issues, high latency, or have unexpectedly terminated the event stream. 

These are server-side problems within the Home Connect infrastructure and cannot be resolved by the plugin. The public API used by third-party integrations often experiences these issues independently of the official Home Connect mobile app. The plugin is designed to handle these interruptions by automatically attempting to re-establish the connection once the servers are responsive again. During these periods, appliances may appear as `No Response` in HomeKit. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for known outages.

#### Why does the log show `Home Connect subsystem not available` or a `503` error?

<!-- INCLUDES: issue-73-03ca -->
The error `Home Connect API error: Home Connect subsystem not available [503]` indicates a server-side maintenance issue or infrastructure outage. This is not a fault with the plugin or your local configuration. When this happens, the official Home Connect mobile application may also fail to connect. The issue is typically transient and is usually resolved by the Home Connect team within a few hours. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

#### Why am I seeing `getaddrinfo EAI_AGAIN` in my logs?

<!-- INCLUDES: issue-50-0475 issue-137-6081 -->
The error `getaddrinfo EAI_AGAIN` is a standard networking error indicating a temporary failure in DNS name resolution. This means your local system or Homebridge host is unable to resolve the IP address for the Home Connect API servers (`api.home-connect.com`). This is usually caused by a transient loss of internet connectivity, a local router performing a reboot, or general network congestion. 

To resolve this issue, ensure your Homebridge server has a stable internet connection and that your DNS provider is not experiencing outages. If this happens at a consistent time, check for scheduled tasks in your local network. The plugin will automatically attempt to reconnect once the network connection is restored.

#### Why is the log flooded with errors during a Home Connect outage?

<!-- INCLUDES: issue-34-01de -->
When the Home Connect API experiences a service outage, the plugin may rapidly log attempts to restart the event stream. This behaviour is a deliberate design choice to ensure quick recovery:

1. **State Consistency**: The plugin relies on the event stream for real-time updates. Frequent reconnection attempts ensure the plugin synchronises with your appliances as soon as the service resumes, minimising stale data in HomeKit.
2. **Diagnostic Integrity**: Detailed logs of every connection attempt and the specific error returned (e.g. `Service Temporarily Unavailable`) are vital for diagnosing complex or intermittent API failures.
3. **API Rate Limits**: The plugin is optimised to stay within rate limits. Introducing manual delays or 'wait' logic adds complexity that could interfere with the normal recovery process.

While this results in a high volume of logs during an outage, it ensures the plugin recovers as reliably as possible without manual intervention.

#### Why does my multi-cavity oven show a `BSH.Common.Error.InvalidUIDValue` error?

<!-- INCLUDES: issue-2-c470 -->
This error typically occurs with multi-cavity appliances where only the main oven supports Home Connect functionality. If the Home Connect API continues to advertise the secondary oven despite it lacking remote capabilities, queries for its programs will fail with `BSH.Common.Error.InvalidUIDValue`. 

The plugin handles this gracefully by ignoring the error and disabling program control for the unsupported cavity. This is an issue with the Home Connect API's device enumeration, which is occasionally addressed by manufacturer server-side updates.

### Authorisation Issues

#### Why does authorisation fail with `invalid_request` or `request rejected by client authorization authority`?

* **OAuth Flow**: Must be set to `Device Flow`. This cannot be changed after the application is created; if it is set incorrectly (e.g. to *Authorization Code Grant Flow*), you must create a new application. Incorrect flow often results in a `grant_type is invalid` error.
* **Client ID**: This must be exactly 64 hexadecimal characters. Ensure no extra spaces or quotes were included. Do not use the default "API Web Client" credentials, as these are for the simulator only.
* **Application Settings**: `One Time Token Mode`, `Proof Key for Code Exchange` (PKCE), and `Sync to China` (unless applicable) must all be disabled.
* **Propagation Delay**: New applications or changes in the developer portal are not always active immediately. While often faster, it can take up to 48 hours for a new `Client ID` to propagate across the Home Connect infrastructure.

#### Why does authorisation fail with `access_denied` or errors about a "limited user list"?

<!-- INCLUDES: issue-82-2ddc issue-121-ccc6 issue-162-1a03 -->
The error `client has limited user list - user not assigned to client` or `access_denied` typically occurs when the account attempting to authorise is not correctly associated with the application in the Home Connect Developer Portal. 

To resolve this, ensure the following:
* **Account Consistency**: The email address used for the Home Connect mobile app must be listed as the "Home Connect user account for testing" in the developer portal.
* **Lowercase Email**: The Home Connect backend performs case-sensitive comparisons. Ensure your email address is entered in **all lowercase letters** in both the developer portal and during the login process.
* **SingleKey ID**: If you have not yet migrated your legacy Home Connect account to a SingleKey ID, you may need to do so. Log out and back in to the official mobile app to ensure all new terms of use are accepted.
* **Avoid Plus Addresses**: Using email aliases (e.g. `user+homebridge@example.com`) is inconsistently supported and should be avoided.

#### Why does the authorisation link expire or fail with an `expired_token` error?

<!-- INCLUDES: issue-97-1958 issue-125-9208 issue-151-9c3a -->
Authorisation links and their associated device codes are only valid for a limited time, typically between 10 and 30 minutes. If this window is exceeded, or if a link is used more than once, the Home Connect API will return `expired_token` or `the code entered is invalid or has expired`.

If the authorisation fails:
* **Check for Stale Links**: Ensure you are using the most recent URL from the Homebridge logs or the plugin configuration UI. 
* **Wait for Auto-Retry**: The plugin handles these errors by waiting 60 seconds before automatically generating a new authorisation attempt. 
* **Version Check**: If the link appears as `[object Promise]`, you are using an obsolete version of the plugin. Ensure you have updated to at least `v0.29.5`.
* **Single Use**: The `device_code` is invalidated as soon as it is successfully used. Do not attempt to reuse old authorisation URLs.

#### Why is the plugin not starting or failing to show an authorisation URL?

<!-- INCLUDES: issue-28-b9b5 issue-60-6eaf -->
If the plugin does not provide an authorisation URL or appear to load, it is usually due to a configuration error in `config.json` preventing Homebridge from identifying the platform.

First, check the Homebridge logs for `[HomeConnect] Initializing HomeConnect platform...`. If this line is missing, verify your configuration:
* **Incorrect Nesting**: Ensure the `HomeConnect` platform block is a top-level item within the `platforms` array and not accidentally nested inside another plugin's configuration.
* **Missing Client ID**: The plugin requires the `clientid` property to be set. If missing, it will log an error and stop initialization.

To complete the process once initialized:
1. Find the URL in the logs (e.g. `https://api.home-connect.com/security/oauth/device_verify?user_code=XXXX-XXXX`).
2. Open the full URL in a browser and sign in with the account used for your physical appliances.
3. Approve the request. The plugin will automatically detect completion and save the tokens. Avoid manually visiting API token endpoints, which will result in `HTTP method not allowed` errors.

## Apple HomeKit

### HomeKit Accessories, Services, and Characteristics

#### Why does the Apple Home app not show the remaining time or detailed status?

To view the remaining time or use it for automations, you must use a third-party HomeKit application (such as **Eve**, **Home+**, or **Controller for HomeKit**). These applications support displaying a wider range of standard HomeKit characteristics that Apple's own app hides. Additionally, the plugin provides `Stateless Programmable Switch` services that function as automation triggers for events like `Program finished`, `Timer finished`, or `Preheat finished`, which are visible in any HomeKit app.

#### Why are the power and program switches for my appliance in a random order in HomeKit?

<!-- INCLUDES: issue-7-36fe -->
The HomeKit Accessory Protocol (HAP) does not provide a robust or well-defined way for plugins to enforce the display order of multiple services within a single accessory. While the plugin exposes several services, such as the power `Switch` and various program control `Switch` services, individual HomeKit apps determine how to order them.

Attempts to use HAP features like **Primary** or **Linked** services have not consistently improved ordering across different applications; in some cases, these changes actually made the Apple Home app's ordering less predictable. Most third-party HomeKit apps, such as **Eve**, **Home+**, and **Hesperus**, allow users to manually reorder services or characteristics for an accessory within their own interfaces. If you require a specific order, it is recommended to use the manual reordering features provided by these third-party apps.

#### Why can I not hide certain switches, or why do they remain visible after being disabled?

<!-- INCLUDES: issue-25-8397 issue-124-2e72 -->
The main `Switch` service for the appliance power is fundamental to the plugin's architecture and cannot be disabled (other than by disabling the whole appliance). Other services, such as individual program switches, can be disabled in the configuration by selecting **No individual program switches** or using a **Custom list of programs and options**.

If program switches remain visible after you have configured them to be hidden, it is usually due to a mismatch in the appliance identifier (`haId`) in your `config.json`. The plugin matches these identifiers exactly. Ensure that:

1. The `haId` is an exact match, including case and punctuation.
2. There are no leading or trailing spaces in the identifier string.
3. The identifier matches the one shown in the Homebridge logs during plugin startup or the Homebridge UI settings.

#### Why is the `HeaterCooler` service not used for fridge or freezer temperature control?

<!-- INCLUDES: issue-58-06c5 -->
The `HeaterCooler` service in HomeKit is designed specifically for environmental climate control, such as room thermostats or air conditioning units. Using this service for appliances like fridges or freezers introduces issues with Siri and HomeKit semantics. Siri may conflate the appliance's internal temperature with the ambient room temperature, leading to incorrect responses when asking for the kitchen temperature. Furthermore, commands to adjust the room temperature might inadvertently affect the appliance if they share the same HomeKit room.

To maintain the integrity of voice control via Siri, this plugin exposes fridge and freezer modes (such as Super, Eco, Vacation, and Fresh modes) as individual `Switch` services rather than a combined climate control interface. This ensures that these features can be controlled independently without breaking the semantic model of the home's environmental settings.

#### Why can I not set the alarm timer or `AlarmClock` setting on my appliance?

<!-- INCLUDES: issue-77-7f97 -->
HomeKit does not currently define services or characteristics with the correct semantics for a general-purpose appliance alarm timer. Mapping this functionality to existing, unrelated HomeKit services would result in incorrect behaviour and cause issues when using Siri. To maintain HomeKit consistency and ensure reliable voice control, the plugin does not support setting the `BSH.Common.Setting.AlarmClock` timer.

### Notifications & Events

#### Why does my appliance appear as `Stateless Programmable Switch` buttons with numeric labels?

<!-- INCLUDES: issue-1-38d2 issue-3-c53c issue-31-241e issue-43-caee issue-45-fb59 issue-153-91f4 -->
Home Connect communicates many appliance states as **transient events** (e.g. "Drip tray full" or "iDos fill level poor") rather than persistent, queryable states. It is not possible for the plugin to poll the current state (e.g. after a reboot), and many appliances do not reliably generate events when a condition clears. These are mapped to `Stateless Programmable Switch` services, allowing them to be used as automation triggers.

The Apple Home app only displays numeric labels (Button 1, Button 2) for these services. To see what these represent for your specific appliance, check your **Homebridge logs** during startup or use a third-party app like **Eve** or **Home+** which displays descriptive labels. If you do not require these events for automations, you can disable them per-appliance in the plugin configuration to prevent them from appearing in the Home app.

#### Why does the Home app show two (or more) tiles for one appliance?

<!-- INCLUDES: issue-59-593e -->
This is standard Apple Home behaviour. To keep the interface organised, Apple separates different service types into distinct tiles. Specifically, a separate tile is created for the `Stateless Programmable Switch` services used for event triggers.

While you can toggle **Show as Separate Tiles** in the accessory settings, Apple does not currently allow these buttons to be merged into the primary appliance tile. If you do not use these events for automations, you can disable them in the plugin configuration to prevent them from appearing in the Home app.

#### How do I get appliance notifications?

<!-- INCLUDES: issue-38-9780 issue-63-11e1 issue-124-8aea -->
Apple Home only supports native push notifications for specific security-related sensors (Doors, Locks, Smoke, etc.). Most Home Connect events do not fit these categories; forcing them to do so would result in misleading notification text.

To receive notifications for other events, you have two main options:

* **The Official Home Connect App:** The most reliable way to get detailed, text-based push notifications.
* **HomeKit Automations:** Trigger an action via a `Stateless Programmable Switch`. You can generate a HomeKit notification indirectly by having the automation toggle a [homebridge-dummy](https://github.com/mpatfield/homebridge-dummy) Contact Sensor, which *does* support native alerts.

#### How can I disable HomeKit notifications for door events?

<!-- INCLUDES: issue-132-67f7 issue-132-791b -->
Door notifications for appliances like fridges or freezers are managed by the Apple Home app on a per-device basis. To disable them:

1. Open the Apple **Home** app.
2. Tap the **...** icon at the top of the screen and select **Home Settings**.
3. Navigate to the **Doors** section.
4. Locate the specific appliance accessory and toggle off **Activity Notifications**.

Note that this setting must be configured separately on each iPhone or iPad where you want to silence the notifications. Alternatively, you can use the per-appliance configuration options in the plugin to remove the `Door` service entirely if you do not require its state information in HomeKit.

## Third-party Platforms

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

#### Why are features available in IFTTT or the official app missing from this plugin?

<!-- INCLUDES: issue-23-d116 issue-188-cb08 -->
This plugin is restricted by the capabilities of the public Home Connect API. Certain features, such as Dryer AutoSense (synchronising programs between a washing machine and dryer), are available to official partners like IFTTT via private API integrations but are not exposed to third-party developers. If a specific program or option (such as `dryer_select_connected_dry_program`) is not documented in the [official Home Connect API documentation](https://api-docs.home-connect.com/programs-and-options/), it cannot be supported by this plugin. If you require these features, you should contact the Home Connect team directly to request their addition to the public API.

Direct integration with IFTTT to bridge these gaps has been explicitly declined to maintain plugin stability and avoid architectural complexity. The maintainer's rationale includes several key technical and design constraints:

1. **Complexity and Maintenance**: Implementing a hybrid control system where some actions use the Home Connect API and others use IFTTT would create significant code complexity and "feature creep".
2. **User Configuration Burden**: Direct integration would rely on users manually creating appropriate IFTTT applets and then precisely configuring this plugin to match, which is prone to user error.
3. **Interface Clutter**: Adding additional manual switches for IFTTT actions would further clutter the HomeKit interface, making the existing list of program switches more difficult to navigate.
4. **Free Plan Limitations**: The IFTTT free tier supports a maximum of two applets, and some Home Connect features are only available via a "Pro+" plan, so most users would receive limited benefit.

For users who require IFTTT-specific functionality, such as triggering automations from Hood Favourite button presses, it is recommended to use a dedicated plugin such as `homebridge-ifttt` alongside this one. This approach keeps the logic for different services separate and more manageable.

## Plugin Installation and Updates

### Plugin Setup and Troubleshooting

#### Why is the plugin not starting or showing an authorisation URL?

<!-- INCLUDES: issue-28-b9b5 issue-194-f6ee -->
If the plugin does not appear to be loading or is not providing an authorisation URL in the logs, it is usually due to a configuration error in `config.json` that prevents Homebridge from identifying the platform.

First, check your Homebridge logs for the line: `[HomeConnect] Initializing HomeConnect platform...`. If this is absent, the plugin is not being loaded. This typically occurs because the `HomeConnect` configuration block is incorrectly nested (e.g. placed inside another plugin's configuration) or is missing from the `platforms` array entirely.

Second, ensure that your configuration adheres to the plugin's strict schema. Prior to v0.37.0, adding a `name` property to the configuration would trigger a validation error (such as `<PLATFORM_CONFIG>.name is not a ApplianceConfig`). While newer versions permit this property, it must be added manually to `config.json` as it is not exposed in the Homebridge Config UI.

Finally, verify that the `clientid` property is set correctly. If it is missing, the plugin will log an error and stop. Once correctly initialised, the logs will provide a URL (e.g. `https://verify.home-connect.com?user_code=XXXX-XXXX`) which you must visit in a browser to authorise the plugin.

#### Why do I get a `Device authorization session has expired` or `401 Unauthorized` error during setup?

<!-- INCLUDES: issue-121-ccc6 issue-162-1a03 -->
These errors indicate that the account used for authorisation is not correctly configured or recognised by the Home Connect servers.

*   **Session Expired**: This typically occurs if the SingleKey ID account is not fully verified. Ensure you have logged into the official Home Connect mobile app, completed your profile, and accepted all pending terms of service or email verifications.
*   **401 Unauthorized / Limited User List**: This error occurs when the account attempting to login is not associated with the application in the Home Connect Developer Portal. Ensure that the `clientid` in your configuration exactly matches the one in the Developer Portal, and that you are using the same email address for both the mobile app and the developer account.

Note that changes in the Developer Portal can take up to 48 hours to propagate across the Home Connect infrastructure. If your settings are correct, waiting for this period often resolves authorisation failures.

#### Why does the error `ReadableStream is not defined` occur when loading the plugin?

<!-- INCLUDES: issue-195-84f2 -->
This error occurs when running the plugin on an unsupported version of Node.js. The `homebridge-homeconnect` plugin requires a minimum of Node.js 18. This requirement is consistent with the standards for Homebridge verified plugins. To resolve this, update your environment (including platforms like HOOBS) to Node.js 18 or later.

#### Why does the log show `The appliance is offline` when the device is connected in the official app?

<!-- INCLUDES: issue-15-25d9 -->
The `The appliance is offline` message in the logs indicates that the plugin has lost its connection to the Home Connect **Event Stream**. The plugin relies on this persistent stream for real-time status updates. If the stream is interrupted, the plugin flags the appliance as offline to prevent commands being sent based on stale data.

It is possible for an appliance to appear functional in the official Home Connect app—which can use alternative communication methods—while being reported as offline in Homebridge if the API's event-based connection is unavailable. Ensure your network allows persistent outgoing connections and check for any regional Home Connect service interruptions.

#### Why is my log flooded with `Service Temporarily Unavailable` errors during an outage?

<!-- INCLUDES: issue-34-01de -->
When the Home Connect API experiences an outage, the plugin rapidly attempts to restart the event stream. This is a deliberate design choice to ensure state consistency. Because of strict API rate limits, the plugin relies almost entirely on the event stream for updates; attempting to reconnect immediately ensures the window for missed events is kept as small as possible once service resumes.

While this results in a high volume of logs, it provides the precise diagnostic detail required to identify specific failure mechanisms and ensures the plugin recovers automatically without manual intervention as soon as the servers are back online.

#### Why are some features available in the official app or IFTTT missing from the plugin?

<!-- INCLUDES: issue-4-f130 issue-188-cb08 -->
This plugin is limited by the capabilities of the public Home Connect API. Certain features (such as Dryer AutoSense) are available to official partners like IFTTT via private API integrations but are not exposed to third-party developers. If a program or option is not documented in the [official Home Connect API documentation](https://api-docs.home-connect.com/programs-and-options/), it cannot be supported by the plugin.

Additionally, because the maintainer does not own every appliance type, some features (like hood lights) may be untested. If a documented feature is missing or non-functional, providing debug logs can help refine the implementation for hardware the maintainer cannot access directly.

#### Why do I see an `InvalidStepSize` or `SDK.Error.InvalidOptionValue` error?

<!-- INCLUDES: issue-18-1fff -->
The Home Connect API requires that values for certain program options (such as `FillQuantity` or `StartInRelative`) are exact multiples of a specific step size. If a value does not align with these increments, the API returns a validation error.

The plugin attempts to mitigate this by providing dropdown menus in the Homebridge UI for options with few permitted values, or by specifying the required step size in the field description. When entering values manually, ensure they are multiples of the required increment; using the up/down arrows in the UI should typically snap the value to the correct step.

#### Why do program switches remain visible after disabling them in the configuration?

<!-- INCLUDES: issue-25-8397 -->
This is typically caused by a mismatch in the appliance identifier (`haId`) within your `config.json`. The plugin applies per-appliance settings by matching the `haId` exactly. Ensure there are no leading or trailing spaces and that the case and punctuation match exactly what is shown in the Homebridge logs during startup. The logic for hiding switches is consistent across all appliance types (except Hoods), so an identifier mismatch is the most common cause of settings failing to apply.

#### Why does my coffee machine show `Not responding` when using the switch in the Home app?

<!-- INCLUDES: issue-149-a6ae -->
Coffee machines expose multiple `Switch` services (Power, Active Program, etc.). By default, the Apple Home app may group these into a single tile. Toggling this combined tile attempts to activate all switches simultaneously. Because coffee machines require time to initialise, attempting to start a program at the same time as powering on usually results in a `Not responding` status.

To resolve this, you should configure the Home app to display these services individually:
1. Open the accessory details for the coffee machine in the **Home** app.
2. Select **Show as Separate Tiles**.
This allows you to power on the machine first and wait for it to reach a ready state before triggering a specific program switch.

#### Why does my coffee machine power switch fail with `SDK.Error.InvalidSettingState`?

<!-- INCLUDES: issue-22-3aca -->
This error (specifically `BSH.Common.Setting.PowerState currently not available or writable`) occurs when the appliance is in a state where it cannot process remote commands. This is most commonly caused by a maintenance prompt on the physical appliance screen, such as "Change water filter" or "Descaling required". Because the Home Connect API does not always expose the details of these prompts to the plugin, you must manually resolve the message on the appliance's control panel before remote control via HomeKit can resume.

#### Why are all my appliance power switches named the same in the Home app?

<!-- INCLUDES: issue-33-f0df -->
The Apple Home app often displays the service name (e.g. `Power`) rather than the accessory name in its automation and tile interfaces. To resolve this, you can manually rename the services within the Home app (e.g. rename the power toggle to `Dishwasher Power`). Alternatively, using a third-party app like **Eve for HomeKit** or **Controller for HomeKit** will provide better context by showing which accessory each service belongs to.

#### How do I control my hood fan speed using Siri?

<!-- INCLUDES: issue-2-ee14 -->
Siri maps fan speeds to specific percentages: **Low** is 25%, **Medium** is 50%, and **High** is 100%. The plugin maps these percentages to the closest available physical fan settings of your hood. Use commands like `Hey Siri, set the hood fan to medium` or `Hey Siri, set the hood fan to 100%`. Note that numeric commands like `set fan to 1` are not supported by Siri for HomeKit fan services.

#### Why does my multi-cavity oven show `BSH.Common.Error.InvalidUIDValue`?

<!-- INCLUDES: issue-2-c470 -->
This error occurs with multi-cavity appliances where only the main oven cavity supports Home Connect functionality. If the API advertises the secondary oven despite it lacking remote capabilities, queries for its programs will fail. The plugin handles this by ignoring the error and disabling program control for the unsupported cavity. This is a known limitation of how certain appliances are enumerated by the Home Connect API.

#### Why do other Homebridge plugins show No Response after installing this plugin?

<!-- INCLUDES: issue-164-bbc4 -->
Homebridge plugins operate in isolation; the Home Connect plugin cannot directly interfere with others. If multiple unrelated plugins show `No Response`, it typically indicates a problem at the Homebridge process level. Check your logs to see if the entire process is crashing; if so, consider running the Home Connect plugin in a **Child Bridge**. This isolates the plugin, preventing a crash or resource issue from affecting the rest of your HomeKit setup.

### Plugin Configuration and Troubleshooting

#### How should I configure the Home Connect application in the developer portal?

<!-- INCLUDES: issue-51-db9a issue-60-3cca -->
When registering your application on the [Home Connect Developer Portal](https://developer.home-connect.com/applications), you must use specific settings for compatibility with this plugin:

1. **OAuth Flow**: This **must** be set to `Device Flow`. This setting is immutable once the application is created; if set incorrectly, you must create a new application.
2. **Client ID**: Use the unique Client ID assigned to your new application. Do not use the default *API Web Client* ID.
3. **Redirect URI**: While not used by the `Device Flow`, this field is mandatory. You may enter any valid URL, such as `https://localhost`.

Ensure that the `simulator` option in your Homebridge configuration is set to `false` (or omitted) unless you are explicitly using the Home Connect appliance simulators.

#### Why am I having trouble with the authorisation process or SingleKey ID?

<!-- INCLUDES: issue-82-2ddc issue-97-1958 -->
Home Connect now requires SingleKey ID for authentication. When authorising the plugin:

*   Ensure your SingleKey ID uses the **same email address** as your Home Connect account.
*   The email address must be entered in **all lowercase letters** to match the case-sensitive requirements of the developer portal.
*   Complete the authorisation via the URL provided in the Homebridge logs promptly. The Home Connect API provides a limited 10-minute window before the session expires, which results in a `Device authorization session not found, expired or blocked [expired_token]` error.
*   If a session expires, the plugin will automatically attempt to generate a new authorisation URL after 60 seconds.

#### Why can't I see all appliance features or status details in the Apple Home app?

<!-- INCLUDES: issue-5-1a70 issue-6-5287 issue-8-226b -->
The standard Apple **Home app** has limited support for appliance-specific characteristics. To access detailed information such as **Program Remaining Time**, **Active** status, or **Pause/Resume** controls, you must use a third-party HomeKit app like **Eve for HomeKit** or **Home+**.

Note that the Eve app interprets the `Status Active` characteristic strictly. It may display a red warning or an 'inactive' message if the appliance is in a state such as `Pause`, `ActionRequired`, `Error`, or `Aborting`. The plugin maps idle states like `Ready` or `Finished` to `Status Active = true` to prevent misleading warnings when the appliance is simply waiting to be used.

#### Why are appliance status updates failing or showing connectivity errors?

<!-- INCLUDES: issue-42-9162 issue-50-0475 issue-74-d6d6 issue-78-c9c7 -->
The plugin maintains a long-lived HTTP event stream for real-time updates. If this connection fails, you may see errors or stalls:

*   `EAI_AGAIN`: A temporary DNS resolution failure, usually caused by transient network loss or router reboots.
*   `ESOCKETTIMEDOUT`: Occurs if the plugin receives no activity for 120 seconds; the plugin will automatically re-establish the stream.
*   **Status Stalls**: If updates stop but no errors appear, the Home Connect backend may have stopped sending events. Restarting Homebridge usually resolves this.
*   **No Programs Supported**: This message indicates transient API instability. Ensure the appliance is reachable in the official Home Connect app and restart Homebridge.
*   **Program Not Supported Warning**: The log message `Selected program ... is not supported` is a cosmetic warning during startup while the plugin is still loading the supported program list; it can be safely ignored.

#### Why does my appliance not show ambient light colour controls in HomeKit?

<!-- INCLUDES: issue-54-f83f -->
This usually happens if the Home Connect API failed to report colour support during initial discovery. Many appliances only expose the `BSH.Common.Setting.AmbientLightColor` setting when the light is switched on. If manual control of the appliance recently blocked API commands, discovery may have failed.

To resolve this, ensure you are on `v0.23.2` or later, stop Homebridge, and delete the appliance's cache file in `~/.homebridge/homebridge-homeconnect/persist` (the filename is an MD5 hash of the appliance ID). Restart Homebridge while the appliance is in standby to trigger a fresh discovery.

#### Why are certain features like fridge temperature or alarm timers missing?

<!-- INCLUDES: issue-58-06c5 issue-77-7f97 -->
The plugin omits certain HomeKit mappings to preserve the integrity of Siri voice control and semantic accuracy:

*   **Fridges/Freezers**: These do not use the `HeaterCooler` service because Siri conflates these with ambient room temperature. To prevent Siri from inadvertently cooling the fridge when you ask to cool the room, fridge modes (e.g. Super-Cool, Eco) are exposed as individual `Switch` services.
*   **Alarm Timers**: HomeKit lacks a service with appropriate semantics for appliance-specific timers. To avoid unreliable behaviour and maintain consistency, `BSH.Common.Setting.AlarmClock` is not supported.

#### Why is Pause or Resume support inconsistent between different appliances?

<!-- INCLUDES: issue-8-5b9e -->
Although the Home Connect API documentation suggests broad support, the actual implementation varies by appliance type and firmware. Many appliances (including various ovens and dishwashers) do not support `PauseProgram` or `ResumeProgram` via the public API. The plugin dynamically detects these capabilities for each device; if the options are missing in HomeKit, your specific hardware or firmware likely does not support the feature.

#### Why do I get an `npm ERR! ENOTEMPTY` error when updating the plugin?

<!-- INCLUDES: issue-53-9275 -->
This is an `npm` package manager error occurring when a file is held open or a directory cannot be renamed during an update. To resolve this, stop the Homebridge service, manually delete the temporary directory identified in the error log (e.g., `.homebridge-homeconnect-XXXXXXXX`), and then retry the installation.

<!-- EXCLUDED: issue-1-2779 issue-1-96fa issue-3-b11b issue-3-e25e issue-5-7189 issue-10-f54e issue-13-159f issue-13-d6c6 issue-17-9299 issue-21-4a0f issue-24-3f2d issue-27-2626 issue-32-3eeb issue-35-2eee issue-36-116c issue-43-3166 issue-47-127f issue-65-324a issue-67-1639 issue-72-52a3 issue-77-48d3 issue-77-ea0e issue-78-26c0 issue-80-1fb6 issue-84-bee9 issue-85-0a95 issue-89-ea9b issue-91-e7db issue-93-7521 issue-97-c838 issue-108-a5c4 issue-116-e2ec issue-118-9a71 issue-141-5245 issue-144-f92c issue-145-8923 issue-181-e108 -->
