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

### Why does my appliance fail to start when using the switch in the Home app?

<!-- INCLUDES: issue-149-a6ae -->
For most appliances this plugin exposes multiple `Switch` services to HomeKit, including:

* **Power**: Controls the standby state of the machine.
* **Active Program**: Starts or stops the currently selected program.
* **Individual Programs**: Start (or select) a specific named program.
* **Modes**: Any settings that the appliance supports, such as `SabbathMode` or `SuperModeFreezer`.

By default, the Apple Home app may group these separate services into a single tile. Toggling this combined tile attempts to activate all switches simultaneously, which results in conflicting requests. The plugin attempts to detect and ignore such invalid actions.

To resolve this, you should configure the Home app to display these services individually using the Home app's **Show as Separate Tiles** option. You will then be able to control the switches individually.

### Programs and Options

<!-- PARTITION -->

#### Why does the log show `Unexpected fields in Home Connect API response` or `extraneous` fields?

<!-- INCLUDES: issue-175-e941 -->
This log message indicates that the plugin has received data from the Home Connect API that is not currently defined in its internal schema. The plugin performs strict validation on all API responses to ensure data integrity and to help with discovery of undocumented API capabilities.

These warnings typically appear when the Home Connect API is updated with new, undocumented fields or appliance-specific features that the plugin does not yet recognise. Although they appear as warnings in the logs, they are generally **non-critical** and do not usually affect the basic functionality or control of your appliances.

In most cases the plugin will write a message to the Homebridge log similar to:
> Home Connect API returned keys/values that are unrecognised by this plugin
> Please report these by creating a new GitHub issue using this link:

If you see this message, please use the provided link to report it on GitHub. This enables discovery and implementation of undocumented API features.

#### Why are some appliance features, programs, or options missing?

<!-- INCLUDES: issue-1-3c2c issue-3-9883 issue-42-1683 issue-44-70cc issue-62-1f79 issue-67-1639 issue-75-7835 issue-94-e55f issue-122-9466 issue-157-61a1 -->
The official Home Connect app and certain third-party integrations (like IFTTT) use a **private API** with functionality not yet available to the public API used by this plugin. Because the plugin dynamically queries the Home Connect API for capabilities, it can only expose features that the manufacturer permits third-party developers to access.

To verify official support, you can check the [Home Connect API Documentation](https://api-docs.home-connect.com). If a feature is missing from the public API, you can [Contact Home Connect Developer Support](https://developer.home-connect.com/support/contact) to request its inclusion.

#### Why does the log say a selected program is not supported by the Home Connect API?

<!-- INCLUDES: issue-50-fe74 -->
Some appliances support programs that the public API can **monitor** but not **control**. This usually applies to:

* **Maintenance**: Rinsing cycles, drum cleaning, or descaling.
* **Favourites**: User-configured buttons on the physical machine.

The API does not allow the plugin to start these programs remotely, but it does report when they are running. The plugin logs when programs are reported that were not advertised as supported during initialisation. This is normal behaviour and not a fault.

#### Why are all options missing for some programs?

<!-- INCLUDES: issue-17-eee1 issue-29-d8b2 issue-76-eaa5 issue-186-ee7e -->
The plugin discovers available programs and their options by querying the Home Connect API during Homebridge startup. This often fails if the appliance is powered off, disconnected from Wi-Fi, busy running a program, performing a cleaning cycle, has an open door, is low on supplies (e.g. water or coffee beans), or does not have Remote Control enabled.

Technical constraints within the API can also cause this. In particular, some appliances advertise support for programs that cannot be selected via the API (typically Sabbath or maintenance programs). Log messages about these programs can be safely ignored; they do not indicate a fault with the plugin.

The plugin caches program details persistently. To manually trigger a rescan, ensure the appliance is switched on and ready, then use the HomeKit **Identify** function. If only some options appear missing, it is likely an API limitation where not all functionality is exposed to third-party developers.

#### How can I enable specific dishwasher options like half load or extra dry in HomeKit?

<!-- INCLUDES: issue-138-eb88 -->
Home Connect splits appliance control into global [settings](https://api-docs.home-connect.com/settings/) and program-specific [options](https://api-docs.home-connect.com/programs-and-options/).

Where appropriate, this plugin provides HomeKit services to control appliance **settings**. These correspond to features like Child Lock that apply regardless of whether there is an active program.

Program **options**, such as `half load` or `extra dry` for dishwashers, are only relevant to individual programs. By default, this plugin creates a HomeKit `Switch` for each supported program using its default settings. To use specific options, you must define them in the plugin configuration by selecting the **Custom list of programs and options** option.

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

To see these default values, enable **Debug Logging** and use the **Identify** function in HomeKit. The plugin will output a detailed list of every default value currently reported by the API.

#### Why do my Oven programs only run for one minute?

<!-- INCLUDES: issue-55-d41a issue-70-5614 -->
This is a quirk of the Home Connect API. Unlike manual operation, any oven program started remotely **must** have a defined duration. If no duration is provided, the API uses a default value (usually 60 seconds).

To fix this, you must configure **Custom list of programs and options** in the plugin settings and explicitly set a `Duration` (e.g. `3600` seconds for 1 hour). This ensures the oven remains on until you manually stop it or the timer expires.

#### How can I reduce the number of switches created for appliance programs?

<!-- INCLUDES: issue-49-3c91 -->
By default, the plugin creates individual switches for every supported program. For appliances with many cycles, such as washing machines or dryers, this can result in dozens of switches cluttering the HomeKit interface.

To hide these switches and simplify the interface open the Homebridge UI plugin settings, select the specific appliance, and choose the **No individual program switches** option. This suppresses the individual program switches while maintaining core functionality such as status monitoring, timers, and power controls.

Alternatively, use the **Custom list of programs and options** option and specify the list of programs that you want to be visible in HomeKit. This option also enables configuration of the settings to use for each program.

### Appliance Status

<!-- PARTITION -->

#### Why does my appliance status (like door state) appear stuck in HomeKit?

<!-- INCLUDES: issue-170-3230 -->
The plugin relies on a real-time Server Sent Events (SSE) stream from Home Connect to be notified of all appliance status changes. When a door is opened or closed, the appliance should trigger a `STATUS` event containing the `BSH.Common.Status.DoorState` key. If these events are not generated by the appliance firmware or the cloud service, the plugin cannot update HomeKit.

You can verify this by checking Homebridge logs with debug mode enabled (e.g. by enabling the **Log Debug as Info** plugin option) to see all events received from the Home Connect API. If no door state events are logged when you manipulate the door, the issue resides with the Home Connect platform. The plugin cannot periodically poll the API for status updates because Home Connect rate limits are extremely restrictive; it only polls the full status upon startup or after recovering from a connection outage, and relies on accurate events to update the state.

#### Why does the log show a program running or time remaining when my appliance is off?

<!-- INCLUDES: issue-5-4389 -->
The plugin logs and displays status information exactly as it is received from the Home Connect API server. If the logs indicate that a program is active or showing a countdown (e.g. `Program 1858 seconds remaining`) while the appliance is physically off, it means the Home Connect server is out of sync with the hardware.

To resolve this, try starting and then stopping a manual program using the official Home Connect app to reset the server state. This is typically a transient server-side issue and cannot be corrected by the plugin itself.

#### Why does my dishwasher trigger a Program Finished event when it reconnects?

<!-- INCLUDES: issue-66-f64f -->
Some Bosch dishwasher models appear to re-broadcast the `BSH.Common.Event.ProgramFinished` event when re-establishing a connection to the Home Connect cloud after being offline. The plugin maps events from the API directly to HomeKit triggers; therefore, these re-broadcasts are passed through as button presses or notifications. This is a quirk of the appliance firmware or API event handling rather than a defect in the plugin itself.

#### Why is my Homebridge log filling up with oven `Event STATUS` temperature messages?

<!-- INCLUDES: issue-64-694f -->
These events are generated whenever the Home Connect servers report a change in the appliance's internal temperature. Most ovens remain in a standby state after use where they continue to monitor and report cooling progress.

The plugin logs all status information reported by the API. To prevent these messages from cluttering your main logs, it is recommended to run the plugin in a separate Homebridge **Child Bridge**. This isolates the plugin's output and ensures that high-volume events do not obscure logs from other plugins.

### Home Connect Errors

<!-- PARTITION -->

#### Why does my appliance show a `409 Conflict` error?

<!-- INCLUDES: issue-1-e985 issue-40-f8f5 issue-61-1c74 issue-83-53f1 issue-99-fe79 issue-155-6e9f issue-113-d74c -->
The Home Connect API uses `409 Conflict` errors for a wide variety of failures that result in a request being rejected. The error message usually provides more details of the specific reason. Some of the more common cases are:

* `SDK.Error.HomeAppliance.Connection.Initialization.Failed`: This indicates that the appliance is not connected to the Home Connect cloud servers. Note that the official Home Connect app may still function by communicating directly via your local Wi-Fi network, whereas this plugin is restricted to using the official cloud API. To troubleshoot:
  1. In the official app, navigate to the appliance's **Settings** > **Network** and ensure all three connection stages (appliance-app, appliance-cloud, and app-cloud) are green.
  2. Test the official app while your phone's Wi-Fi is disabled; if it fails to control the appliance over cellular data, the issue is with the appliance's cloud connection.
  3. Power cycle the appliance or restart your router to refresh the connection to the Home Connect servers.
  4. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for outages.

* `SDK.Error.InvalidSettingState`: This behaviour is usually caused by inconsistencies in the Home Connect API regarding an appliance's power state capabilities. The API may incorrectly report that an appliance (common with fridges, freezers, and hobs) supports being switched to `Off` or `Standby` when it is actually read-only. Control functionality typically resumes once the manufacturer corrects the device constraints for your specific model.

* `SDK.Error.ProgramNotAvailable`: This is returned when you attempt to start a program that the API considers unavailable for remote execution. This may be due to appliance settings (e.g. requiring consumables or enabling a specific mode like Sabbath) or firmware bugs advertising programs that cannot be started remotely.

For details of other `409` errors refer to the [Home Connect API Errors](https://api-docs.home-connect.com/general/#api-errors) documentation.

#### Why does the power button not work or return a `BSH.Common.Error.WriteRequest.Busy` error?

<!-- INCLUDES: issue-112-6c3a issue-116-1125 -->
The `Busy` error is returned by the Home Connect cloud when an appliance cannot process a command, often because it requires physical interaction (e.g. filling a water tank or closing a door). If you encounter this error, check the physical display of the appliance or the official Home Connect app to see if a manual action is required. This issue may also be caused by a transient issue with the Home Connect cloud service itself; check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

Failure to power certain ovens on or off is a known bug in the Home Connect API affecting specific models. If the appliance physically ready but the power command is rejected, this is an external platform limitation. You should report such issues to [Home Connect Developer Support](https://developer.home-connect.com/support/contact) with your appliance's E-Nr (part number).

#### What does an `SDK.Error.504.GatewayTimeout` error mean?

<!-- INCLUDES: issue-11-d4f5 -->
An `SDK.Error.504.GatewayTimeout` error indicates that the Home Connect cloud servers are experiencing internal issues or high latency. This is a server-side problem with the Home Connect infrastructure and cannot be resolved by the plugin. During these periods, appliances may appear as `No Response` in HomeKit. These errors are usually transient and resolve once the Home Connect service stabilises. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

#### Why does the log show `Home Connect subsystem not available` or a `503` error?

<!-- INCLUDES: issue-73-03ca -->
The error `Home Connect API error: Home Connect subsystem not available [503]` indicates a server-side maintenance issue or infrastructure outage. This is not a fault with the plugin or your local configuration. When this happens, the official Home Connect mobile application may also fail to connect. The issue is typically transient and is usually resolved by the Home Connect team within a few hours. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

#### What does a `Proxy Error` in the logs mean?

<!-- INCLUDES: issue-13-daa9  -->
A `Proxy Error` indicates that the Home Connect API servers unexpectedly terminated the event stream. This is a server-side issue within the Home Connect infrastructure and is not caused by the plugin. The plugin is designed to handle these interruptions by automatically attempting to re-establish the connection. If these errors occur frequently, it usually indicates transient instability in the Home Connect cloud service. Check the [Home Connect Server Status (unofficial)](https://homeconnect.thouky.co.uk) for recent issues.

#### Why am I seeing `getaddrinfo EAI_AGAIN` in my logs?

<!-- INCLUDES:  issue-137-6081 -->
The error `getaddrinfo EAI_AGAIN` is a standard networking error indicating a temporary failure in DNS name resolution. This means your local system or Homebridge host is unable to resolve the IP address for the Home Connect API servers. To resolve this issue:

1. Check your local network's DNS settings and ensure your Homebridge server has a stable internet connection.
2. Verify that your DNS provider is not experiencing outages or blocking requests to `api.home-connect.com`.
3. If you are using a specific environment like a Docker container, ensure that the networking stack is correctly configured, as this error originates from the host system rather than the plugin itself.

### Authorisation Issues

<!-- PARTITION -->

#### Why does authorisation fail with `invalid_request` or `request rejected by client authorization authority`?

<!-- INCLUDES: issue-82-05c8 issue-86-3b75 -->
These errors are returned when the provided `Client ID` is not recognised or is improperly formatted. Check the following:

* **Incorrect Format**: The `Client ID` must be exactly 64 hexadecimal characters. Ensure no extra spaces, quotes, or hidden characters were included when copying the ID from the developer portal.
* **Propagation Delay**: New applications created in the Home Connect Developer Portal are not always active immediately. It can take up to an hour for a new `Client ID` to propagate to the production authorisation servers. Try again later.
* **Production Credentials**: The default "API Web Client" credentials provided in the portal are for the appliance simulator only. If you are connecting physical appliances, you must create a new application in the developer portal to obtain a production `Client ID`.

#### Why does authorisation fail with `invalid_client` or `unauthorized_client`?

<!-- INCLUDES: issue-115-c713 issue-117-1a0f -->
These errors are returned by the Home Connect API and indicate a configuration mismatch in the [Home Connect Developer Portal](https://developer.home-connect.com/):

Ensure the `Client ID` in your Homebridge configuration exactly matches the one in the portal, and that the application is configured as follows:
* **Home Connect user account for testing**: This must exactly match the email address used for your Home Connect mobile app.
* **OAuth Flow**: Device Flow.
* **Success Redirect**: Leave blank (or set to a valid URL).
* **One Time Token Mode**: Disabled.
* **Proof Key for Code Exchange**: Disabled.
* **Sync to China**: Disabled, unless you are using the Home Connect servers in China.

If the configuration is correct but errors persist, try deleting and recreating the application in the developer portal to reset its state.

#### Why does authorisation fail with `expired_token` or `the code entered is invalid or has expired`?

<!-- INCLUDES: issue-125-9208 -->
This error typically occurs during the initial OAuth authorisation process due to one of the following reasons:

* **Propagation Delay**: New applications created in the Home Connect Developer Portal are not always active immediately. It can take up to an hour for a new `Client ID` to propagate to the production authorisation servers. Try again later.
* **Stale Authorisation Links**: The `device_code` in the authorisation URL is typically only valid for 5 minutes. If you use an older link, it will have expired. Check the Homebridge UI plugin configuration editor or log file for a more recent URL.

### Why does authorisation fail with `access_denied` or `device authorization session has expired`?

<!-- INCLUDES: issue-121-ccc6 -->
This error typically occurs when the SingleKey ID account used for authorisation is not fully configured or verified in the official mobile app. It is sometimes necessary to convert a Home Connect account to SingleKey ID or accept new terms of use before the account can be used with this plugin. To resolve this, Log Out from the official Home Connect app on your mobile device and Log In again, ensuring that you accept all necessary agreements.

## Apple HomeKit

### HomeKit Accessories, Services, and Characteristics

<!-- PARTITION -->

#### Why does the Apple Home app not show the remaining time for my appliance?

<!-- INCLUDES: issue-48-237c issue-114-0f03 issue-124-9bb6 -->
The plugin exposes the `Remaining Duration` characteristic to HomeKit for all supported appliances, typically on the `Active Program` switch service. However, the Apple Home app only displays this information for specific accessory types defined in the HomeKit Accessory Protocol (HAP) specification, such as `Irrigation System` and `Valve` services, which are not appropriate for Home Connect appliances.

To view the remaining time or use it for automations, you must use a third-party HomeKit application (such as Eve, Home+, or Controller for HomeKit). These applications support displaying a wider range of standard HomeKit characteristics that Apple's own app hides.

#### Why are the power and program switches for my appliance in a random order in HomeKit?

<!-- INCLUDES: issue-7-36fe -->
The HomeKit Accessory Protocol (HAP) does not provide a robust or well-defined way for plugins to enforce the display order of multiple services within a single accessory. While the plugin exposes several services, such as the power `Switch` and various program control `Switch` services, individual HomeKit apps determine how to order them.

Attempts to use HAP features like **Primary** or **Linked** services have not consistently improved ordering across different applications; in some cases, these changes actually made the Apple Home app's ordering less predictable. Most third-party HomeKit apps, such as Eve, Home+, and Hesperus, allow users to manually reorder services or characteristics for an accessory within their own interfaces. If you require a specific order, it is recommended to use the manual reordering features provided by these third-party apps.

#### Can I hide the power or active program switches for my appliance?

<!-- INCLUDES: issue-124-2e72 -->
The main `Switch` service for the appliance power is fundamental to the plugin's architecture and cannot be disabled (other than by disabling the whole appliance). The `Switch` services for individual programs can be disabled by selecting **No individual program switches**, or individually enabled with **Custom list of programs and options**. All other services can be individually enabled or disabled for each appliance.

### Notifications & Events

<!-- PARTITION -->

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

<!-- INCLUDES: issue-132-791b issue-132-67f7 -->
Door notifications for appliances like fridges or freezers are managed by the Apple Home app on a per-device basis. To disable them:

1. Open the Apple **Home** app.
2. Tap the **...** icon at the top of the screen and select **Home Settings**.
3. Navigate to the **Doors** section.
4. Locate the specific appliance accessory and toggle off **Activity Notifications**.

Note that this setting must be configured separately on each iPhone or iPad where you want to silence the notifications. Alternatively, you can use the per-appliance configuration options in the plugin to remove the `Door` service entirely if you do not require its state information in HomeKit.

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


<!-- EXCLUDED: issue-1-2779 issue-3-b11b issue-3-e25e issue-5-7189 issue-10-f54e issue-13-d6c6 issue-17-9299 issue-21-4a0f issue-24-3f2d issue-27-2626 issue-32-3eeb issue-35-2eee issue-36-116c issue-43-3166 issue-47-127f issue-65-324a issue-67-1639 issue-72-52a3 issue-77-48d3 issue-77-ea0e issue-78-26c0 issue-80-1fb6 issue-84-bee9 issue-85-0a95 issue-89-ea9b issue-91-e7db issue-93-7521 issue-97-c838 issue-144-f92c issue-145-8923 issue-181-e108 issue-108-a5c4 issue-116-e2ec issue-118-9a71 issue-141-5245 issue-13-159f issue-1-96fa -->
