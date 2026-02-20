# Frequently Asked Questions (FAQ)

## Home Connect

### Local/Remote Control

#### Why does my appliance show `No Response` when I try to start a program?

<!-- INCLUDES: issue-3-09c6 issue-79-56b4 -->
To protect your safety and prevent your appliance from starting unexpectedly:

- **Remote Start must be physically enabled** on the appliance itself before remote control is allowed
- This cannot be set via the API
- Some appliances automatically expire Remote Start after a period of time or when you open the appliance door

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

- **Power**: Controls the standby state of the machine.
- **Active Program**: Starts or stops the currently selected program.
- **Individual Programs**: Start (or select) a specific named program.
- **Modes**: Any settings that the appliance supports, such as `SabbathMode` or `SuperModeFreezer`.

By default, the Apple Home app may group these separate services into a single tile. Toggling this combined tile attempts to activate all switches simultaneously, which results in conflicting requests. The plugin attempts to detect and ignore such invalid actions.

**For example**: If your dishwasher has a Power switch, an Active Program switch, and three individual program switches (Eco, Intensive, Quick), toggling the combined tile tries to turn on power **and** start all three programs at once; an impossible operation.

To resolve this, you should configure the Home app to display these services individually using the Home app's **Show as Separate Tiles** option.

### Programs and Options

#### Why does the log show `Unexpected fields`, `extraneous` keys, or `(unrecognised)` values?

<!-- INCLUDES: issue-175-e941 issue-189-35bc issue-198-658c issue-199-2e94 -->
These log messages indicate that the plugin has received data from the Home Connect API that is not currently defined in its internal schema or contradicts official documentation. The plugin performs strict validation on all API responses to ensure data integrity and to assist in the discovery of undocumented or evolving API capabilities.

Common scenarios include:
- **Undocumented Fields**: Newer appliances or regional variations often report features that haven't been previously mapped.
- **Type Mismatches**: Some models, particularly refrigeration, may report statuses (like door states) using identifiers that differ from the standard API specification.
- **API Key Inconsistencies**: There are known cases where the API uses keys slightly different from its own documentation, such as `LaundryCare.Washer.Option.IDos1.Active` (with an extra period) instead of the documented version.

Although these appear as warnings, they are generally **non-critical** and do not affect basic functionality. If the logs state that the API returned unrecognised keys/values, please use the GitHub link provided in the log to report them. This allows the maintainer to update the plugin's internal registry and add support for these features.

#### Why are some appliance features, programs, or options missing?

<!-- INCLUDES: issue-1-3c2c issue-3-9883 issue-4-f130 issue-42-1683 issue-44-70cc issue-62-1f79 issue-67-1639 issue-75-7835 issue-94-e55f issue-122-9466 issue-157-61a1 -->
There are three primary reasons why features may be missing from the plugin:

1. **Private API Limitations**: The official Home Connect app and certain partners (like IFTTT) use a private API with functionality not available to third-party developers. If a feature is missing from the [official public API documentation](https://api-docs.home-connect.com), the plugin cannot access it.
2. **Experimental Support**: Support for some device types is implemented based on documentation without access to physical hardware. Some features may be experimental or untested; providing debug logs via a GitHub issue can help refine these implementations.
3. **Manufacturer Constraints**: Manufacturers may choose not to expose specific features to the public API for safety or marketing reasons. You can contact [Home Connect Developer Support](https://developer.home-connect.com/support/contact) to request the inclusion of missing features in the public API.

#### Why does the log say a selected program is not supported by the Home Connect API?

<!-- INCLUDES: issue-50-fe74 issue-78-c9c7 -->
This warning typically occurs in two different contexts:

- **Monitor-Only Programs**: Some appliances support maintenance cycles (such as rinsing, drum cleaning, or descaling) and user-configured favourites that the API allows the plugin to monitor but not control remotely. **For example**, a coffee machine might report "Rinse Active" when you manually start the cleaning cycle, but the plugin cannot initiate that cycle remotely. The plugin logs these when they are detected but cannot be started via HomeKit.
- **Startup Timing**: You may see a transient warning during Homebridge startup or after clearing the cache. This happens if an appliance reports a program selection event before the plugin has finished loading the full list of supported programs from the API. The plugin will automatically fetch the necessary details once initialisation is complete.

In both cases, these messages are often cosmetic and do not indicate a functional failure.

#### Why are all options missing, or why is an appliance showing as `Not Responding`?

<!-- INCLUDES: issue-17-eee1 issue-26-a87b issue-29-d8b2 issue-42-9162 issue-54-f83f issue-76-eaa5 issue-186-ee7e -->
The plugin discovers appliance capabilities during startup and caches them. This process can fail if the appliance is powered off, disconnected from Wi-Fi, busy, has an open door, or is low on supplies. Technical issues such as Home Connect API instability or temporary outages can also cause the message `This appliance does not support any programs`.

To resolve these issues and refresh the appliance metadata:

1. Ensure the appliance is switched on, connected, and not in use.
2. Use the HomeKit **Identify** function (found in accessory settings) to trigger a rescan of supported programs and options.
3. If the issue persists, you may need to clear the persistent cache. Stop Homebridge and navigate to `~/.homebridge/homebridge-homeconnect/persist`. Delete the files corresponding to your appliance (the filenames are MD5 hashes). **Do not delete** the file named `94a08da1fecbb6e8b46990538c7b50b2` as this contains your account authorisation.
4. Restart Homebridge to force a fresh discovery.

#### Why do I see an `InvalidStepSize` or `SDK.Error.InvalidOptionValue` error?

<!-- INCLUDES: issue-18-1fff -->
The Home Connect API requires that certain values follow strict increments. If a value is provided that is not an exact multiple of the required step size, the API will return a validation error.

The plugin attempts to mitigate this by providing dropdown menus or adding the required step size to the field description in the Homebridge UI. When manually entering values, ensure they align with the increments specified in the configuration interface. Using the up/down arrows in the Homebridge UI will typically snap the value to the correct step.

#### Why are Pause and Resume features missing or inconsistent?

<!-- INCLUDES: issue-8-226b issue-8-5b9e -->
Experimental support for pausing and resuming programs is implemented via the HomeKit `Active` characteristic, but there are several limitations:

- **App Support**: Apple's native Home app does not display the pause/resume controls for most appliance types. You must use a third-party app like *Eve* or *Home+* to access these functions.
- **API Inconsistency**: Support for these commands varies significantly between firmware versions. Many appliances do not support `PauseProgram` via the public API despite documentation suggesting otherwise. Others, may support pausing but not resuming.

The plugin dynamically detects supported commands for each specific appliance. If the options do not appear in a compatible third-party app, it indicates your hardware or firmware does not support the feature via the public API.

#### How can I trigger the Identify function in the Eve app?

<!-- INCLUDES: issue-37-b6a0 -->
To trigger the `Identify` mechanism within the Eve app:

1. Navigate to the **Rooms** tab and locate the appliance.
2. Tap the name of the appliance to open the detailed view (do not tap a toggle or slider).
3. Tap the appliance name or the small arrow at the top of the screen, just below the **Edit** button.
4. Tap the **ID** button that appears next to the settings cog.

This will trigger the identification sequence on the physical appliance and force the plugin to refresh its cached data.

#### How can I enable dishwasher options like Half Load or Extra Dry in HomeKit?

<!-- INCLUDES: issue-138-eb88 -->
Home Connect distinguishes between global [settings](https://api-docs.home-connect.com/settings/) (like Child Lock) and program-specific [options](https://api-docs.home-connect.com/programs-and-options/) (like Half Load).

The plugin provides HomeKit services for settings that apply globally. However, program options are only relevant when a specific program is selected. By default, the plugin creates a HomeKit `Switch` for each program using its default settings. To use specific options, you must configure a **Custom list of programs and options** in the plugin settings and explicitly define the options for each switch.

#### Why does my appliance turn on automatically or Homebridge startup stall?

<!-- INCLUDES: issue-19-6db6 issue-20-4547 issue-72-9eb7 -->
To learn an appliance's specific options, the plugin must select each program via the API. Many appliances only report these options correctly when the power is on, the program is selected and ready to be used.

If the plugin does not have a valid cache, it will attempt to turn the appliance on, iterate through all available programs, and then restore the appliance to its original state. This should only happen **once**. If it occurs every time Homebridge restarts, it suggests the discovery process was interrupted (e.g. by manual operation or the appliance being offline) and is retrying. If no cache exists and the appliance is offline, startup will stall until a connection is established.

#### Which settings are used for programs started without specific options?

<!-- INCLUDES: issue-46-2122 -->
If a program is started without custom options, the Home Connect server uses the **appliance defaults**. These are usually the factory defaults or the settings used the last time that program was run manually.

To view these default values, enable **Debug Logging** and use the **Identify** function. The plugin will output a detailed list of every default value currently reported by the API to the Homebridge log.

#### Why do my oven programs only run for one minute?

<!-- INCLUDES: issue-55-d41a issue-70-5614 -->
When started remotely via the API, oven programs **must** have a defined duration. If no duration is provided by the plugin, the Home Connect API typically defaults to a value of 60 seconds.

To resolve this, use the **Custom list of programs and options** in the plugin settings to explicitly set a `Duration` (for example, `3600` seconds) for your oven switches. This ensures the oven remains on until the timer expires or you manually stop it.

#### How can I reduce the number of switches created for appliance programs?

<!-- INCLUDES: issue-49-3c91 -->
By default, the plugin creates individual `Switch` services for every supported program, which can clutter HomeKit with many controls that are rarely used. To simplify the interface, change the **Program Switches** plugin configuration option for the appliance:

- **No individual program switches**: Hide all program switches.
- **A switch to start each *appliance* program** (default): Advertise all available programs to HomeKit, using the default options for each.
- **Custom list of programs and options**: Select the list of programs you want to appear in HomeKit, explicitly specifying the options for each.

### Appliance Status

#### Why does my appliance status appear stuck or show as offline in HomeKit?

<!-- INCLUDES: issue-15-25d9 issue-74-d6d6 issue-170-3230 -->
The plugin relies on a real-time Server Sent Events (SSE) stream from the Home Connect API to receive status updates. If this stream is interrupted or the backend stops sending events, the plugin cannot update HomeKit. 

The API sends a `KEEP-ALIVE` event approximately every 55 seconds; if the plugin detects no activity for 120 seconds, it will automatically re-establish the stream. In some cases, the connection may remain technically active while the Home Connect backend stops distributing actual state change events, either due to events not being received from the appliance or internal errors within the cloud infrastructure.

To troubleshoot:

1. Enable the **Log Debug as Info** plugin option to see all raw events received from the API. If no events are logged when you interact with the appliance, the issue resides with the Home Connect platform or appliance.
2. Restart Homebridge to force the plugin to subscribe to a fresh event stream.
3. Ensure your network configuration does not prematurely terminate long-lived TCP connections.

#### Why is my appliance unresponsive in Homebridge but working in the Home Connect app?

<!-- INCLUDES: issue-71-a9f3 -->
The official Home Connect mobile app can communicate with appliances via the local Wi-Fi network when your phone is on the same network. In contrast, this plugin and all third-party integrations must use the public Home Connect cloud API. It is possible for an appliance to have a working local connection but a stalled cloud connection.

To diagnose this, disable Wi-Fi on your mobile device to force the Home Connect app to use a cellular (remote) connection. If the appliance becomes unresponsive in the app while on cellular data, the issue lies with the appliance's connection to the Home Connect servers rather than the plugin. You can often resolve this by power cycling the appliance. If problems persist check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for outages.

#### Why do my appliances remain visible in the Home app when they are turned off or offline?

<!-- INCLUDES: issue-52-2dc8 -->
The plugin synchronises accessories based on the list of appliances registered to your Home Connect account. As long as an appliance is associated with your account in the Home Connect API, it will persist in HomeKit. Being unreachable or powered off does not trigger the removal of the accessory from HomeKit, but the Home app will display it as **No Response**. Dynamically adding and removing appliances from HomeKit based on their connectivity would result in loss of user configuration, such as their name, location, scenes, and automations.

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

### Home Connect API Errors

#### Why does my appliance show a `409 Conflict` error?

<!-- INCLUDES: issue-1-e985 issue-22-3aca issue-40-f8f5 issue-61-1c74 issue-83-53f1 issue-99-fe79 issue-113-d74c issue-155-6e9f issue-186-6cfd -->
The Home Connect API uses `409 Conflict` errors for a wide variety of failures that result in a request being rejected. The error message usually provides more details of the specific reason. Some of the more common cases are:

- `SDK.Error.HomeAppliance.Connection.Initialization.Failed`: This indicates that the appliance is not connected to the Home Connect cloud servers. Note that the official Home Connect app may still function by communicating directly via your local Wi-Fi network, whereas this plugin is restricted to using the official cloud API. To troubleshoot:
  1. In the official app, navigate to the appliance's **Settings** > **Network** and ensure all three connection stages (appliance-app, appliance-cloud, and app-cloud) are green.
  2. Test the official app while your phone's Wi-Fi is disabled; if it fails to control the appliance over cellular data, the issue is with the appliance's cloud connection.
  3. Power cycle the appliance or restart your router to refresh the connection to the Home Connect servers.
  4. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for outages.

- `SDK.Error.InvalidSettingState`: This occurs when a setting is currently read-only or unavailable. It is often caused by inconsistencies in the API regarding power state capabilities (common with fridges, freezers, and hobs). On other appliances, like coffee machines, it frequently indicates a maintenance message is displayed on the physical screen (e.g. "Change water filter" or "Descaling required") that requires manual confirmation before remote control can resume.

- `SDK.Error.ProgramNotAvailable`: This is returned when you attempt to start a program that the API considers unavailable for remote execution. This may be due to appliance settings, safety features (e.g. local control active), or firmware bugs.

For details of other `409` errors refer to the [Home Connect API Errors](https://api-docs.home-connect.com/general/#api-errors) documentation.

#### Why does the power button not work or return a `BSH.Common.Error.WriteRequest.Busy` error?

<!-- INCLUDES: issue-112-6c3a issue-116-1125 -->
The `Busy` error is returned by the Home Connect cloud when an appliance cannot process a command, often because it requires physical interaction (e.g. filling a water tank or closing a door). If you encounter this error, check the physical display of the appliance or the official Home Connect app to see if a manual action is required. This issue may also be caused by a transient issue with the Home Connect cloud service itself; check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

Failure to power certain ovens on or off is a known bug in the Home Connect API affecting specific models. If the appliance is physically ready but the power command is rejected, this is an external platform limitation. You should report such issues to [Home Connect Developer Support](https://developer.home-connect.com/support/contact) with your appliance's E-Nr (part number).

#### What do `Gateway Timeout` or `Proxy Error` messages in the log mean?

<!-- INCLUDES: issue-11-d4f5 issue-13-daa9 issue-19-6154 -->
Errors such as `SDK.Error.504.GatewayTimeout` or `Proxy Error` indicate that the Home Connect cloud servers are experiencing internal issues, high latency, or have unexpectedly terminated the event stream. 

These are server-side problems within the Home Connect infrastructure and cannot be resolved by the plugin. The public API used by third-party integrations often experiences these issues independently of the official Home Connect mobile app. The plugin is designed to handle these interruptions by automatically attempting to re-establish the connection once the servers are responsive again.

**What you can do**:
- Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for known outages
- Wait for automatic recovery (typically 5-30 minutes)
- If the issue persists for hours, restart Homebridge to force a fresh connection

#### Why does the log show `Home Connect subsystem not available` or a `503` error?

<!-- INCLUDES: issue-73-03ca -->
The error `Home Connect API error: Home Connect subsystem not available [503]` indicates a server-side maintenance issue or infrastructure outage. This is not a fault with the plugin or your local configuration. When this happens, the official Home Connect mobile application may also fail to connect. The issue is typically transient and is usually resolved by the Home Connect team within a few hours. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

#### Why am I seeing `getaddrinfo EAI_AGAIN` in my logs?

<!-- INCLUDES: issue-50-0475 issue-137-6081 -->
The error `getaddrinfo EAI_AGAIN` is a standard networking error indicating a DNS name resolution failure. This means your local system or Homebridge host is unable to resolve the IP address for the Home Connect API servers (`api.home-connect.com`). This is usually caused by a transient loss of internet connectivity, a local router performing a reboot, or network misconfiguration. 

To resolve this issue, ensure your Homebridge server has a stable internet connection and that your DNS provider is not experiencing outages. The plugin will automatically attempt to reconnect once the network connection is restored. For permanent failures, especially when using a Docker container, check that `api.home-connect.com` can be correctly resolved from within the environment running Homebridge.

#### Why is the log flooded with errors during a Home Connect outage?

<!-- INCLUDES: issue-34-01de -->
When the Home Connect API experiences a service outage, the plugin may rapidly log attempts to restart the event stream.

**This is expected behaviour.** The plugin is designed to recover automatically as soon as the service resumes.

Technical rationale:

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

<!-- INCLUDES: issue-82-05c8 issue-86-3b75 issue-117-1a0f -->
These errors are returned when the provided `Client ID` is not recognised or is improperly formatted. Check the following:

- **Incorrect Format**: The `Client ID` must be exactly 64 hexadecimal characters. Ensure no extra spaces, quotes, or hidden characters were included when copying the ID from the developer portal.
- **Propagation Delay**: New applications created in the Home Connect Developer Portal are not always active immediately. It can take up to an hour for a new `Client ID` to propagate to the production authorisation servers. Try again later.
- **Production Credentials**: The default "API Web Client" credentials provided in the portal are for the appliance simulator only. If you are connecting physical appliances, you must create a new application in the developer portal to obtain a production `Client ID`.

#### Why does authorisation fail with `invalid_client`, `grant_type is invalid`, `unauthorized_client`, or `client has limited user list - user not assigned to client`?

<!-- INCLUDES: issue-115-c713 issue-117-1a0f issue-51-db9a issue-60-3cca issue-115-c713 issue-162-1a03 -->
These errors are returned by the Home Connect API and indicate a configuration mismatch in the [Home Connect Developer Portal](https://developer.home-connect.com/):

Ensure the `Client ID` in your Homebridge configuration exactly matches the one in the portal, and that the application is configured as follows:
- **Home Connect user account for testing**: This must exactly match the email address used for your Home Connect mobile app.
- **OAuth Flow**: Device Flow.
- **Success Redirect**: Leave blank (or set to a valid URL).
- **One Time Token Mode**: Disabled.
- **Proof Key for Code Exchange**: Disabled.
- **Sync to China**: Disabled, unless you are using the Home Connect servers in China.

If the configuration is correct but errors persist, try deleting and recreating the application in the developer portal to reset its state.

#### Why does the authorisation link expire or fail with an `expired_token` error?

<!-- INCLUDES: issue-97-1958 issue-125-9208 issue-151-9c3a -->
Authorisation links and their associated device codes are only valid for a limited time. If this window is exceeded, or if a link is used more than once, the Home Connect API will return `expired_token` or `the code entered is invalid or has expired`.

If the authorisation fails:
- **Propagation Delay**: New applications created in the Home Connect Developer Portal are not always active immediately. It can take up to an hour for a new `Client ID` to propagate to the production authorisation servers. Try again later.
- **Check for Stale Links**: Ensure you are using the most recent URL from the Homebridge logs or the plugin configuration UI. 
- **Wait for Auto-Retry**: The plugin handles these errors by waiting 60 seconds before automatically generating a new authorisation attempt. 
- **Single Use**: The `device_code` is invalidated as soon as it is successfully used. Do not attempt to reuse old authorisation URLs.

#### Why does authorisation fail with `access_denied` or `device authorization session has expired`?

<!-- INCLUDES: issue-121-ccc6 issue-82-2ddc -->
This error typically occurs when the SingleKey ID account used for authorisation is not fully configured or verified in the official mobile app. It is sometimes necessary to convert a Home Connect account to SingleKey ID or accept new terms of use before the account can be used with this plugin. To resolve this, Log Out from the official Home Connect app on your mobile device and Log In again, ensuring that you accept all necessary agreements.

#### Why is the plugin not starting or failing to show an authorisation URL?

<!-- INCLUDES: issue-28-b9b5 issue-60-6eaf -->
If the plugin does not provide an authorisation URL or appear to load, it is usually due to a configuration error in `config.json` preventing Homebridge from identifying the platform.

First, check the Homebridge logs for `[HomeConnect] Initializing HomeConnect platform...`. If this line is missing, verify your configuration:
- **Incorrect Nesting**: Ensure the `HomeConnect` platform block is a top-level item within the `platforms` array and not accidentally nested inside another plugin's configuration.
- **Missing Client ID**: The plugin requires the `clientid` property to be set. If missing, it will log an error and stop initialization.

To complete the process once initialized:

1. Find the URL in the logs (e.g. `https://api.home-connect.com/security/oauth/device_verify?user_code=XXXX-XXXX`).
2. Open the full URL in a browser and sign in with the SingleKey ID account used in the official Home Connect mobile app.
3. Approve the request. The plugin will automatically detect completion and save the tokens.

## Apple HomeKit

### HomeKit Accessories, Services, and Characteristics

#### Why does the Apple Home app not show the remaining time or detailed status for my appliance?

<!-- INCLUDES: issue-2-d759 issue-5-1a70 issue-48-237c issue-68-c945 issue-114-0f03 issue-124-9bb6 -->
The plugin exposes the `Remaining Duration` characteristic to HomeKit for all supported appliances, typically on the `Active Program` switch service. However, the Apple Home app only displays this information for specific accessory types defined in the HomeKit Accessory Protocol (HAP) specification, such as `Irrigation System` and `Valve` services. These services are semantically inappropriate for most Home Connect appliances, and using them would create an inconsistent architectural model and break existing automations.

To view the remaining time or use it for automations, you must use a third-party HomeKit application (such as *Eve*, *Home+*, or *Controller for HomeKit*). Look for the **Remaining Duration** characteristic on the Active Program switch service. These applications support displaying a wider range of standard HomeKit characteristics that Apple's own app hides.

#### Why are the power and program switches for my appliance in a random order in HomeKit?

<!-- INCLUDES: issue-7-36fe -->
The HomeKit Accessory Protocol (HAP) does not provide a robust or well-defined way for plugins to enforce the display order of multiple services within a single accessory. While the plugin exposes several services, such as the power `Switch` and various program control `Switch` services, individual HomeKit apps determine how to order them.

Attempts to use HAP features like **Primary** or **Linked** services have not consistently improved ordering across different applications; in some cases, these changes actually made the Apple Home app's ordering less predictable. Most third-party HomeKit apps, such as *Eve*, *Home+*, and *Hesperus*, allow users to manually reorder services or characteristics for an accessory within their own interfaces. If you require a specific order, it is recommended to use the manual reordering features provided by these third-party apps.

#### Why can I not hide certain switches, or why do they remain visible after being disabled?

<!-- INCLUDES: issue-25-8397 issue-124-2e72 -->
The main `Switch` service for the appliance power is fundamental to the plugin's architecture and cannot be disabled (other than by disabling the whole appliance). All other services, including the other `Switch` services for individual programs, can be individually enabled or disabled for each appliance within the plugin configuration.

If services remain visible in HomeKit after you have configured them to be hidden then it is likely to be due to a HomeKit caching and synchronisation issue. Some potential solutions are:

- Just wait (cache synchronisation issues often resolve on their own in a few hours)
- Restart Homebridge (usually sufficient to trigger a clean refresh)
- Reboot the Home Hub (typically an Apple TV or HomePod)
- Sign out of iCloud on the Home Hub and back in again, to force resynchronisation
- In persistent cases, remove the Homebridge bridge from HomeKit entirely and re-add it

#### Why is temperature control not supported for fridges/freezers or ovens?

<!-- INCLUDES: issue-58-06c5 -->
HomeKit Accessory Protocol (HAP) only defines a few standard services that support temperature (`Heater Cooler`, `Temperature Sensor`, and `Thermostat`). These are all associated with environmental climate control.

Using these services for appliances introduces issues:

- **Siri confusion**: Siri may conflate the appliance's internal temperature with ambient room temperature
- **Incorrect voice responses**: Asking "what's the temperature in the kitchen?" might report the fridge's setting instead of room temperature
- **Unintended control**: Commands to adjust room temperature might inadvertently affect the appliance

To maintain the integrity of voice control via Siri, this plugin exposes fridge and freezer modes (such as Super, Eco, Vacation, and Fresh modes) as individual `Switch` services.

#### Why can I not set the alarm timer or `AlarmClock` setting on my appliance?

<!-- INCLUDES: issue-77-7f97 -->
HomeKit does not currently define services or characteristics with the correct semantics for a general-purpose appliance alarm timer. Mapping this functionality to existing, unrelated HomeKit services would result in incorrect behaviour and cause issues when using Siri. To maintain HomeKit consistency and ensure reliable voice control, the plugin does not support setting the `BSH.Common.Setting.AlarmClock` timer.

### Notifications & Events

#### Why does my appliance appear as `Stateless Programmable Switch` buttons with numeric labels?

<!-- INCLUDES: issue-1-38d2 issue-3-c53c issue-31-241e issue-43-caee issue-45-fb59 issue-153-91f4 -->
Home Connect communicates many appliance states as **transient events** (e.g. "Drip tray full" or "iDos fill level poor") rather than persistent, queryable states. It is not possible for the plugin to poll the current state (e.g. after a reboot), and many appliances do not reliably generate events when a condition clears. These are mapped to `Stateless Programmable Switch` services, allowing them to be used as automation triggers.

The Apple Home app only displays numeric labels (Button 1, Button 2) for these services. To see what these represent for your specific appliance, check your **Homebridge logs** during startup or use a third-party app like *Eve* or *Home+* which displays descriptive labels. If you do not require these events for automations, you can disable them per-appliance in the plugin configuration to prevent them from appearing in the Home app.

#### Why does the Home app show two (or more) tiles for one appliance?

<!-- INCLUDES: issue-59-593e -->
This is standard Apple Home behaviour. To keep the interface organised, Apple separates different service types into distinct tiles. Specifically, a separate tile is created for the `Stateless Programmable Switch` services used for event triggers.

While you can toggle **Show as Separate Tiles** in the accessory settings, Apple does not currently allow these buttons to be merged into the primary appliance tile. If you do not use these events for automations, you can disable them in the plugin configuration to prevent them from appearing in the Home app.

#### How do I get appliance notifications?

<!-- INCLUDES: issue-38-9780 issue-63-11e1 issue-124-8aea -->
Apple Home only supports native push notifications for specific security-related sensors (Doors, Locks, Smoke, etc.). Most Home Connect events do not fit these categories; forcing them to do so would result in misleading notification text.

To receive notifications for other events, you have two main options:

- **The Official Home Connect App:** The most reliable way to get detailed, text-based push notifications.
- **HomeKit Automations:** Trigger an action via a `Stateless Programmable Switch`. You can generate a HomeKit notification indirectly by having the automation toggle a [homebridge-dummy](https://github.com/mpatfield/homebridge-dummy) Contact Sensor, which *does* support native alerts.

#### How can I disable HomeKit notifications for door events?

<!-- INCLUDES: issue-132-67f7 issue-132-791b -->
Door notifications for appliances like fridges or freezers are managed by the Apple Home app on a per-device basis. To disable them:

1. Open the Apple **Home** app.
2. Tap the **...** icon at the top of the screen and select **Home Settings**.
3. Navigate to the **Doors** section.
4. Locate the specific appliance accessory and toggle off **Activity Notifications**.

Note that this setting must be configured separately on each iPhone or iPad where you want to silence the notifications. Alternatively, you can use the per-appliance configuration options in the plugin to remove the `Door` service entirely if you do not require its state information in HomeKit.

## Siri

#### How do I control my hood fan speed using Siri?

<!-- INCLUDES: issue-2-ee14 -->
Siri maps fan speeds to specific percentages:
- **Low** is 25%
- **Medium** is 50%
- **High** is 100%

The plugin maps these percentages to the closest available physical fan settings of your hood. You can use commands like `Hey Siri, set the hood fan to medium` or `Hey Siri, set the hood fan to 100%`. Note that numeric settings like `set fan to 1` are not supported by Siri for HomeKit fan services.

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
This plugin is restricted by the capabilities of the public Home Connect API. Certain features are available to official partners like IFTTT via private API integrations but are not exposed to third-party developers. If a specific program or option is not documented in the [official Home Connect API documentation](https://api-docs.home-connect.com/programs-and-options/), it cannot be supported by this plugin. If you require these features, you should contact [Home Connect Developer Support](https://developer.home-connect.com/support/contact) directly to request their addition to the public API.

Direct integration with IFTTT to bridge these gaps has been explicitly declined to maintain plugin stability and avoid architectural complexity. The maintainer's rationale includes several key technical and design constraints:

- **Complexity and Maintenance**: Implementing a hybrid control system where some actions use the Home Connect API and others use IFTTT would create significant code complexity and "feature creep".
- **User Configuration Burden**: Direct integration would rely on users manually creating appropriate IFTTT applets and then precisely configuring this plugin to match, which is prone to user error.
- **Interface Clutter**: Adding additional manual switches for IFTTT actions would further clutter the HomeKit interface, making the existing list of program switches more difficult to navigate.
- **Free Plan Limitations**: The IFTTT free tier supports a maximum of two applets, and some Home Connect features are only available via a "Pro+" plan, so most users would receive limited benefit.

For users who require IFTTT-specific functionality, such as triggering automations from Hood Favourite button presses, it is recommended to use a dedicated plugin such as `homebridge-ifttt` alongside this one. This approach keeps the logic for different services separate and more manageable.

## Plugin Installation and Updates

#### Why do I get an `npm ERR! ENOTEMPTY` error when installing or updating the plugin?

<!-- INCLUDES: issue-53-9275 -->
This is an error produced by the `npm` package manager rather than a fault within the plugin code. It typically occurs when `npm` attempts to rename or remove a directory during an update but fails because the target directory is not empty or a file is being held open by another process.

To resolve this issue:

1. Stop the Homebridge service to ensure no processes are actively using the plugin files.
2. Locate the temporary directory identified in the error log (for example, `/usr/local/lib/node_modules/.homebridge-homeconnect-XXXXXXXX`).
3. Manually delete that temporary directory and the existing `homebridge-homeconnect` directory if necessary.
4. Attempt to install the plugin again.

This error is often transient and may also be resolved by simply restarting the host system or retrying the installation via the Homebridge Config UI interface.

<!-- EXCLUDED: issue-1-2779 issue-1-96fa issue-3-b11b issue-3-e25e issue-5-7189 issue-6-5287 issue-10-f54e issue-13-159f issue-13-d6c6 issue-17-9299 issue-21-4a0f issue-24-3f2d issue-27-2626 issue-32-3eeb issue-35-2eee issue-36-116c issue-43-3166 issue-47-127f issue-65-324a issue-67-1639 issue-72-52a3 issue-77-48d3 issue-77-ea0e issue-78-26c0 issue-80-1fb6 issue-84-bee9 issue-85-0a95 issue-89-ea9b issue-91-e7db issue-93-7521 issue-97-c838 issue-108-a5c4 issue-116-e2ec issue-118-9a71 issue-141-5245 issue-144-f92c issue-145-8923 issue-164-bbc4 issue-181-e108 issue-194-f6ee issue-195-84f2 issue-33-f0df issue-56-ce35 issue-57-6cdc issue-190-235a issue-41-6e02 -->
