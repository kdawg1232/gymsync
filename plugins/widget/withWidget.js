const { withXcodeProject, withInfoPlist, withEntitlementsPlist } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGET_TARGET = 'GymSyncWidget';

function withWidgetExtension(config) {
  const bundleIdentifier =
    config.ios?.bundleIdentifier ?? 'com.gymsync.dev';
  const widgetBundleId = `${bundleIdentifier}.widget`;
  const appGroup = `group.${bundleIdentifier}`;

  config = withInfoPlist(config, (config) => {
    return config;
  });

  // Add App Group entitlement so the main app and widget extension can share data
  config = withEntitlementsPlist(config, (config) => {
    const groups = config.modResults['com.apple.security.application-groups'] ?? [];
    if (!groups.includes(appGroup)) {
      groups.push(appGroup);
    }
    config.modResults['com.apple.security.application-groups'] = groups;
    return config;
  });

  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const widgetDir = path.join(projectRoot, 'ios', WIDGET_TARGET);

    if (!fs.existsSync(widgetDir)) {
      fs.mkdirSync(widgetDir, { recursive: true });
    }

    // Write Swift widget source
    const widgetSwift = `
import WidgetKit
import SwiftUI

// MARK: - Progress Widget

struct GymSyncEntry: TimelineEntry {
    let date: Date
    let myCount: Int
    let partnerCount: Int
    let goal: Int
    let myName: String
    let partnerName: String
    let daysLeft: Int
    let streak: Int
}

struct GymSyncProvider: TimelineProvider {
    func placeholder(in context: Context) -> GymSyncEntry {
        GymSyncEntry(date: Date(), myCount: 2, partnerCount: 3, goal: 5,
                     myName: "You", partnerName: "Partner", daysLeft: 4, streak: 3)
    }

    func getSnapshot(in context: Context, completion: @escaping (GymSyncEntry) -> Void) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<GymSyncEntry>) -> Void) {
        let entry = loadEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func loadEntry() -> GymSyncEntry {
        let defaults = UserDefaults(suiteName: "${appGroup}")
        let jsonStr = defaults?.string(forKey: "widget_data") ?? ""

        guard let data = jsonStr.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return GymSyncEntry(date: Date(), myCount: 0, partnerCount: 0, goal: 5,
                                myName: "You", partnerName: "Partner", daysLeft: 0, streak: 0)
        }

        return GymSyncEntry(
            date: Date(),
            myCount: json["myCount"] as? Int ?? 0,
            partnerCount: json["partnerCount"] as? Int ?? 0,
            goal: json["goal"] as? Int ?? 5,
            myName: json["myName"] as? String ?? "You",
            partnerName: json["partnerName"] as? String ?? "Partner",
            daysLeft: json["daysLeft"] as? Int ?? 0,
            streak: json["streak"] as? Int ?? 0
        )
    }
}

struct CircularProgress: View {
    let progress: Double
    let color: Color

    var body: some View {
        ZStack {
            Circle()
                .stroke(color.opacity(0.2), lineWidth: 6)
            Circle()
                .trim(from: 0, to: min(progress, 1.0))
                .stroke(color, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
    }
}

struct GymSyncWidgetEntryView: View {
    var entry: GymSyncEntry

    @Environment(\\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            smallWidget
        case .systemMedium:
            mediumWidget
        default:
            smallWidget
        }
    }

    var smallWidget: some View {
        VStack(spacing: 8) {
            HStack {
                Spacer()
                Text("GymSync")
                    .font(.system(size: 12, weight: .heavy))
                    .foregroundColor(.orange.opacity(0.8))
                Spacer()
            }

            Spacer()

            ZStack {
                CircularProgress(
                    progress: entry.goal > 0 ? Double(entry.myCount) / Double(entry.goal) : 0,
                    color: .green
                )
                .frame(width: 64, height: 64)

                VStack(spacing: 0) {
                    Text("\\(entry.myCount)")
                        .font(.system(size: 22, weight: .black))
                        .foregroundColor(.white)
                    Text("/\\(entry.goal)")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
            }

            Spacer()

            HStack(spacing: 4) {
                if entry.streak > 0 {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.orange)
                    Text("\\(entry.streak)w")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.orange)
                    Text("\\u{00B7}")
                        .foregroundColor(.white.opacity(0.3))
                }
                Text("\\(entry.daysLeft) days left")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.white.opacity(0.4))
            }
        }
        .padding()
        .containerBackground(for: .widget) {
            Color.black
        }
    }

    var mediumWidget: some View {
        HStack(spacing: 0) {
            VStack(spacing: 6) {
                Text(entry.myName)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white.opacity(0.6))
                    .lineLimit(1)

                ZStack {
                    CircularProgress(
                        progress: entry.goal > 0 ? Double(entry.myCount) / Double(entry.goal) : 0,
                        color: .green
                    )
                    .frame(width: 56, height: 56)

                    VStack(spacing: 0) {
                        Text("\\(entry.myCount)")
                            .font(.system(size: 20, weight: .black))
                            .foregroundColor(.white)
                        Text("/\\(entry.goal)")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
            }
            .frame(maxWidth: .infinity)

            VStack(spacing: 4) {
                Spacer()
                Text("GymSync")
                    .font(.system(size: 13, weight: .heavy))
                    .foregroundColor(.orange.opacity(0.8))

                if entry.streak > 0 {
                    HStack(spacing: 2) {
                        Image(systemName: "flame.fill")
                            .font(.system(size: 11))
                            .foregroundColor(.orange)
                        Text("\\(entry.streak)w")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.orange)
                    }
                }
                Spacer()
                Text("\\(entry.daysLeft) days left this week")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.white.opacity(0.4))
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)

            VStack(spacing: 6) {
                Text(entry.partnerName)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white.opacity(0.6))
                    .lineLimit(1)

                ZStack {
                    CircularProgress(
                        progress: entry.goal > 0 ? Double(entry.partnerCount) / Double(entry.goal) : 0,
                        color: .purple
                    )
                    .frame(width: 56, height: 56)

                    VStack(spacing: 0) {
                        Text("\\(entry.partnerCount)")
                            .font(.system(size: 20, weight: .black))
                            .foregroundColor(.white)
                        Text("/\\(entry.goal)")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
        .padding()
        .containerBackground(for: .widget) {
            Color.black
        }
    }
}

struct GymSyncProgressWidget: Widget {
    let kind: String = "GymSyncWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: GymSyncProvider()) { entry in
            GymSyncWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("GymSync Progress")
        .description("Track your weekly workout progress at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Partner Photo Widget

struct PartnerPhotoEntry: TimelineEntry {
    let date: Date
    let partnerName: String
    let imageData: Data?
    let hasPartner: Bool
}

struct PartnerPhotoProvider: TimelineProvider {
    func placeholder(in context: Context) -> PartnerPhotoEntry {
        PartnerPhotoEntry(date: Date(), partnerName: "Partner", imageData: nil, hasPartner: true)
    }

    func getSnapshot(in context: Context, completion: @escaping (PartnerPhotoEntry) -> Void) {
        let info = loadPartnerInfo()
        completion(PartnerPhotoEntry(date: Date(), partnerName: info.name, imageData: nil, hasPartner: info.hasPartner))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PartnerPhotoEntry>) -> Void) {
        let info = loadPartnerInfo()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!

        if let urlStr = info.photoUrl, let url = URL(string: urlStr) {
            URLSession.shared.dataTask(with: url) { data, _, _ in
                let entry = PartnerPhotoEntry(
                    date: Date(),
                    partnerName: info.name,
                    imageData: data,
                    hasPartner: info.hasPartner
                )
                completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
            }.resume()
        } else {
            let entry = PartnerPhotoEntry(
                date: Date(),
                partnerName: info.name,
                imageData: nil,
                hasPartner: info.hasPartner
            )
            completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
        }
    }

    private func loadPartnerInfo() -> (name: String, photoUrl: String?, hasPartner: Bool) {
        let defaults = UserDefaults(suiteName: "${appGroup}")
        let jsonStr = defaults?.string(forKey: "widget_data") ?? ""

        guard let data = jsonStr.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return ("Partner", nil, false)
        }

        let name = json["partnerName"] as? String ?? "Partner"
        let url = json["partnerPhotoUrl"] as? String
        let hasPartner = json["hasPartner"] as? Bool ?? false
        return (name, url, hasPartner)
    }
}

struct PartnerPhotoWidgetEntryView: View {
    var entry: PartnerPhotoEntry

    var body: some View {
        ZStack {
            if let data = entry.imageData, let uiImage = UIImage(data: data) {
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                VStack(spacing: 8) {
                    Image(systemName: entry.hasPartner ? "camera.fill" : "person.badge.plus")
                        .font(.system(size: 28))
                        .foregroundColor(.white.opacity(0.15))
                    Text(entry.hasPartner ? "No gym pic yet" : "No partner yet")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.2))
                }
            }

            VStack {
                HStack {
                    Text("GymSync")
                        .font(.system(size: 10, weight: .heavy))
                        .foregroundColor(.orange.opacity(0.8))
                    Spacer()
                }
                .padding(.top, 2)
                Spacer()
                HStack {
                    VStack(alignment: .leading, spacing: 1) {
                        Text(entry.partnerName)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.white)
                            .lineLimit(1)
                        if entry.imageData != nil {
                            Text("Latest gym pic")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.white.opacity(0.7))
                        }
                    }
                    Spacer()
                }
                .padding(.horizontal, 2)
                .padding(.vertical, 6)
                .background(.ultraThinMaterial.opacity(entry.imageData != nil ? 1 : 0))
                .cornerRadius(8)
            }
        }
        .padding(10)
        .containerBackground(for: .widget) {
            Color.black
        }
    }
}

struct GymSyncPartnerPhotoWidget: Widget {
    let kind: String = "GymSyncPartnerPhoto"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PartnerPhotoProvider()) { entry in
            PartnerPhotoWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Partner's Gym Pic")
        .description("See your partner's latest workout photo.")
        .supportedFamilies([.systemSmall])
    }
}

// MARK: - Widget Bundle

@main
struct GymSyncWidgetBundle: WidgetBundle {
    var body: some Widget {
        GymSyncProgressWidget()
        GymSyncPartnerPhotoWidget()
    }
}
`;

    fs.writeFileSync(path.join(widgetDir, 'GymSyncWidget.swift'), widgetSwift.trim());

    // Write Info.plist for widget extension
    const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>GymSync Widget</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.widgetkit-extension</string>
    </dict>
</dict>
</plist>`;

    fs.writeFileSync(path.join(widgetDir, 'Info.plist'), infoPlist);

    // Write entitlements for the widget extension (App Group for shared data)
    const widgetEntitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>${appGroup}</string>
    </array>
</dict>
</plist>`;

    const entitlementsFileName = `${WIDGET_TARGET}.entitlements`;
    fs.writeFileSync(path.join(widgetDir, entitlementsFileName), widgetEntitlements);

    // Add widget target to Xcode project
    const targetUuid = xcodeProject.generateUuid();
    const groupName = WIDGET_TARGET;

    // Add PBXGroup for widget files
    const widgetGroup = xcodeProject.addPbxGroup(
      ['GymSyncWidget.swift', 'Info.plist', `${WIDGET_TARGET}.entitlements`],
      groupName,
      groupName,
    );

    // Add to main group
    const mainGroupId = xcodeProject.getFirstProject().firstProject.mainGroup;
    xcodeProject.addToPbxGroup(widgetGroup.uuid, mainGroupId);

    // Add widget target
    const target = xcodeProject.addTarget(
      WIDGET_TARGET,
      'app_extension',
      WIDGET_TARGET,
      widgetBundleId,
    );

    // Set build settings on every config whose PRODUCT_NAME matches the widget.
    // updateBuildProperty/target-based lookups don't work reliably for
    // dynamically added extension targets, so we match by product name instead.
    const configs = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key of Object.keys(configs)) {
      const cfg = configs[key];
      if (
        cfg &&
        cfg.buildSettings &&
        (cfg.buildSettings.PRODUCT_NAME === WIDGET_TARGET ||
         cfg.buildSettings.PRODUCT_NAME === `"${WIDGET_TARGET}"`)
      ) {
        cfg.buildSettings.SWIFT_VERSION = '5.0';
        cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '17.0';
        cfg.buildSettings.TARGETED_DEVICE_FAMILY = '"1"';
        cfg.buildSettings.INFOPLIST_FILE = `"${WIDGET_TARGET}/Info.plist"`;
        cfg.buildSettings.CODE_SIGN_ENTITLEMENTS =
          `"${WIDGET_TARGET}/${WIDGET_TARGET}.entitlements"`;
      }
    }

    // Add build phases
    xcodeProject.addBuildPhase(
      ['GymSyncWidget.swift'],
      'PBXSourcesBuildPhase',
      'Sources',
      target.uuid,
    );

    xcodeProject.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
    xcodeProject.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);

    return config;
  });

  return config;
}

module.exports = withWidgetExtension;
