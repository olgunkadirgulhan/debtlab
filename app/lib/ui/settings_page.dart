import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/links.dart';
import 'theme.dart';
import 'widgets.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  Future<void> _open(String url) => launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        children: [
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.language, color: Brand.blue),
                  title: const Text('More calculators on debtlabai.com'),
                  trailing: const Icon(Icons.open_in_new, size: 18),
                  onTap: () => _open(siteUrl),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.play_circle_outline, color: Brand.red),
                  title: const Text('Watch debt tips on YouTube'),
                  trailing: const Icon(Icons.open_in_new, size: 18),
                  onTap: () => _open(youtubeUrl),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.ios_share, color: Brand.green),
                  title: const Text('Share DebtLab'),
                  onTap: () => SharePlus.instance.share(ShareParams(text: 'A free debt payoff planner: $siteUrl')),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.privacy_tip_outlined),
                  title: const Text('Privacy policy'),
                  trailing: const Icon(Icons.open_in_new, size: 18),
                  onTap: () => _open(privacyUrl),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.description_outlined),
                  title: const Text('Terms of use'),
                  trailing: const Icon(Icons.open_in_new, size: 18),
                  onTap: () => _open(termsUrl),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const SectionCard(
            child: Row(
              children: [
                Icon(Icons.lock_outline, color: Brand.green),
                SizedBox(width: 12),
                Expanded(
                  child: Text('Your debts are stored only on this device. No account, no data sent anywhere.',
                      style: TextStyle(height: 1.4)),
                ),
              ],
            ),
          ),
          const DisclaimerText(),
        ],
      ),
    );
  }
}
