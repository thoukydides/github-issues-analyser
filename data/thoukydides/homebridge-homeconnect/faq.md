# Frequently Asked Questions (FAQ)

## Home Connect

### Local/Remote Control

#### Why does my appliance show `No Response` when I try to start a program?

<!-- INCLUDES: issue-79-56b4 issue-3-09c6 -->
To protect your safety and prevent your appliance from starting unexpectedly, the Home Connect API requires **Remote Start** to be physically enabled on the appliance itself before remote control is allowed. This cannot be set via the API. Some appliances automatically expire Remote Start after a period of time or interactions such as opening the appliance door.

If you attempt to start a program via HomeKit when Remote Start is disabled, the plugin intentionally reports an error to HomeKit, which the Apple Home app displays as `No Response`. Reporting "Success" instead would be misleading, as the appliance would not actually start.

This plugin exposes the appliance's Remote Start status via the `Program Mode` characteristic on the power `Switch` service. It is not shown in the Home app, but can be viewed or used to gate automations in third-party apps like *Eve*.

#### What does `LockedByLocalControl` or "Local Intervention" mean?

<!-- INCLUDES: issue-16-bbca issue-2-206a issue-1-9917 -->
If you see an error like `Request cannot be performed temporarily! due to local actuated user intervention [BSH.Common.Error.LockedByLocalControl]`, it means the appliance is currently being operated via its physical buttons or knobs. This is a restriction built into the appliance firmware and the Home Connect API; it cannot be bypassed by the plugin.

To prevent conflicting commands and ensure safety, the Home Connect API blocks all remote control while a user is physically interacting with the appliance. This lockout usually clears a few seconds after you stop touching the controls, although some appliances may maintain the lockout for a longer period during certain maintenance cycles or until a specific manual interaction is completed.

This plugin exposes the appliance's Local Control status via the `Program Mode` characteristic on the power `Switch` service. It is not shown in the Home app, but can be viewed or used to gate automations in third-party apps like *Eve*.

### Programs and Options

#### Why are some appliance features, programs, or options, missing?

<!-- INCLUDES: issue-44-70cc issue-1-3c2c issue-75-7835 issue-67-1639 issue-62-1f79 -->
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

<!-- INCLUDES: issue-20-4547 issue-19-6db6 -->
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

<!-- INCLUDES: issue-70-5614 issue-55-d41a -->
This is a quirk of the Home Connect API. Unlike manual operation, any oven program started remotely **must** have a defined duration. If no duration is provided, the API uses a default value (usually 60 seconds).

To fix this, you must configure **Custom Program Switches** in the plugin settings and explicitly set a `Duration` (e.g. `3600` seconds for 1 hour). This ensures the oven remains on until you manually stop it or the timer expires.

### Home Connect Errors

## HomeKit Services

### Notifications & Events

#### Why does my appliance appear as `Stateless Programmable Switch` buttons?

<!-- INCLUDES: issue-1-38d2 issue-45-fb59 issue-3-c53c issue-43-caee -->
Home Connect communicates many appliance states as **transient events** (e.g. "Drip tray full" or "iDos fill level poor") rather than persistent, queryable states. It is not possible for the plugin to poll the current state (e.g. after a reboot), and many appliances do not reliably generate events when a condition clears.

These events map to `Stateless Programmable Switch` services, allowing them to be used as automation triggers. Other types like `Contact Sensor` are not used because they require a persistent state that cannot be determined reliably, leading to a poor user experience.

The Apple Home app only displays numeric labels (Button 1, Button 2). To see what these represent, check your **Homebridge logs** during startup or use a third-party app like **Eve** or **Home+** which displays the descriptive labels.


#### Why does the Home app show two (or more) tiles for one appliance?

<!-- INCLUDES: issue-59-593e -->
This is standard Apple Home behaviour. To keep the interface organized, Apple separates different service types into distinct tiles. Specifically, a separate tile is created for the `Stateless Programmable Switch` services used for event triggers.

While you can toggle **Show as Separate Tiles**, Apple does not currently allow these buttons to be merged into the primary appliance tile. If you do not use these events for automations, you can disable them in the plugin configuration to prevent them from appearing in the Home app.

#### How do I get appliance notifications?

<!-- INCLUDES: issue-63-11e1 issue-38-9780 -->
Apple Home only supports native push notifications for specific security-related sensors (Doors, Locks, Smoke, etc.). Most Home Connect events do not fit these categories; forcing them to do so would result in misleading notification text.

To receive notifications for other events, you have two main options:

* **The Official Home Connect App:** The most reliable way to get detailed, text-based push notifications.
* **HomeKit Automations:** Trigger an action via a `Stateless Programmable Switch`. You can generate a HomeKit notification indirectly by having the automation toggle a [homebridge-dummy](https://github.com/mpatfield/homebridge-dummy) Contact Sensor, which *does* support native alerts.

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

#### Why not support IFTTT integration for features missing from the Home Connect API?

<!-- INCLUDES: issue-23-d116 -->
IFTTT exposes some functionality that is not available via the official Home Connect API. However, integration with IFTTT has been explicitly declined to maintain plugin stability and avoid architectural complexity. The maintainer's rationale includes several key technical and design constraints:

* **Complexity and Maintenance**: Implementing a hybrid control system where some actions use the Home Connect API and others use IFTTT would create significant code complexity and "feature creep".
* **User Configuration Burden**: Direct integration would rely on users manually creating appropriate IFTTT applets and then precisely configuring this plugin to match, which is prone to user error.
* **Interface Clutter**: Adding additional manual switches for IFTTT actions would further clutter the HomeKit interface, making the existing list of program switches more difficult to navigate.
* **Free Plan Limitations**: The IFTTT free tier supports a maximum of two applets, and some Home Connect features are only available via a "Pro+" plan, so most users would receive limited benefit.

For users who require IFTTT-specific functionality, such as triggering automations from Hood Favourite button presses, it is recommended to use a dedicated plugin such as `homebridge-ifttt` alongside this one. This approach keeps the logic for different services separate and more manageable.

<!-- EXCLUDED: issue-3-e25e issue-3-b11b issue-5-7189 issue-10-f54e issue-13-d6c6 issue-17-9299 issue-21-4a0f issue-32-3eeb issue-36-116c issue-43-3166 issue-65-324a issue-77-ea0e issue-78-26c0 issue-97-c838 issue-93-7521 issue-91-e7db issue-89-ea9b issue-85-0a95 issue-84-bee9 issue-80-1fb6 issue-47-127f issue-67-1639 issue-77-48d3 -->