import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import '../core/debt_math.dart';
import '../core/format.dart';
import '../core/links.dart';
import '../core/models.dart';
import '../core/store.dart';
import 'theme.dart';
import 'widgets.dart';

class PlanPage extends StatelessWidget {
  const PlanPage({super.key});

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    if (store.debts.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('My plan')),
        body: const EmptyState(
          icon: Icons.flag_outlined,
          title: 'No plan yet',
          body: 'Add your debts on the Debts tab and your payoff plan appears here.',
        ),
      );
    }
    final mine = store.planFor(store.strategy);
    final other = store.strategy == Strategy.snowball ? Strategy.avalanche : Strategy.snowball;
    final theirs = store.planFor(other);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My plan'),
        actions: [
          if (mine != null)
            IconButton(
              tooltip: 'Share',
              icon: const Icon(Icons.ios_share),
              onPressed: () => SharePlus.instance.share(ShareParams(
                text: "I'll be debt-free by ${payoffDate(mine.months)}! Planning it with DebtLab: $siteUrl",
              )),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        children: [
          SegmentedButton<Strategy>(
            segments: const [
              ButtonSegment(value: Strategy.avalanche, label: Text('Avalanche'), icon: Icon(Icons.trending_down)),
              ButtonSegment(value: Strategy.snowball, label: Text('Snowball'), icon: Icon(Icons.ac_unit)),
            ],
            selected: {store.strategy},
            onSelectionChanged: (s) => store.strategy = s.first,
          ),
          const SizedBox(height: 6),
          Text(store.strategy.rule, textAlign: TextAlign.center, style: const TextStyle(color: Brand.muted, fontSize: 13)),
          const SizedBox(height: 14),
          _ExtraPayment(store: store),
          const SizedBox(height: 12),
          if (mine == null)
            const SectionCard(
              child: Text("With these payments the debts don't get paid off within 50 years. Raise the extra payment.",
                  style: TextStyle(color: Brand.red, fontWeight: FontWeight.w600)),
            )
          else ...[
            SectionCard(
              child: Column(
                children: [
                  Row(children: [
                    Expanded(child: StatTile(label: 'Debt-free', value: payoffDate(mine.months), color: Brand.blue)),
                    const SizedBox(width: 10),
                    Expanded(child: StatTile(label: 'Total interest', value: money(mine.totalInterest), color: Brand.red)),
                  ]),
                  const SizedBox(height: 10),
                  StatTile(label: 'Time to pay off', value: duration(mine.months)),
                ],
              ),
            ),
            if (theirs != null) ...[
              const SizedBox(height: 12),
              _Comparison(store: store, mine: mine, theirs: theirs, other: other),
            ],
            const SizedBox(height: 12),
            SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total balance over time', style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 14),
                  SizedBox(height: 200, child: _BalanceChart(a: store.planFor(Strategy.avalanche), s: store.planFor(Strategy.snowball))),
                  const SizedBox(height: 8),
                  const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    _Legend(color: Brand.green, label: 'Avalanche'),
                    SizedBox(width: 16),
                    _Legend(color: Brand.blue, label: 'Snowball'),
                  ]),
                ],
              ),
            ),
            const SizedBox(height: 12),
            SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Payoff order', style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  for (var i = 0; i < mine.payoffOrder.length; i++)
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: CircleAvatar(
                        radius: 15,
                        backgroundColor: Brand.blue,
                        child: Text('${i + 1}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                      ),
                      title: Text(mine.payoffOrder[i].name, style: const TextStyle(fontWeight: FontWeight.w600)),
                      trailing: Text(payoffDate(mine.payoffOrder[i].month), style: const TextStyle(color: Brand.muted)),
                    ),
                ],
              ),
            ),
          ],
          const DisclaimerText(),
        ],
      ),
    );
  }
}

class _ExtraPayment extends StatelessWidget {
  const _ExtraPayment({required this.store});
  final AppStore store;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(child: Text('Extra each month', style: TextStyle(fontWeight: FontWeight.w700))),
              Text(money(store.extra), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Brand.green)),
            ],
          ),
          Slider(
            value: store.extra.clamp(0, 2000).toDouble(),
            max: 2000,
            divisions: 80,
            label: money(store.extra),
            onChanged: (v) => store.extra = v,
          ),
          Text('On top of ${money(store.totalMinimum)} in minimums. Total ${money(store.budget)}/mo.',
              style: const TextStyle(color: Brand.muted, fontSize: 13)),
        ],
      ),
    );
  }
}

class _Comparison extends StatelessWidget {
  const _Comparison({required this.store, required this.mine, required this.theirs, required this.other});
  final AppStore store;
  final PayoffResult mine;
  final PayoffResult theirs;
  final Strategy other;

  @override
  Widget build(BuildContext context) {
    final diff = theirs.totalInterest.round() - mine.totalInterest.round();
    final String text;
    if (diff > 0) {
      text = '${store.strategy.label} saves ${money(diff)} in interest vs. ${other.label.toLowerCase()}.';
    } else if (diff < 0) {
      text = '${other.label} would save ${money(-diff)} more here. ${store.strategy.label} can still be worth it if quick wins keep you going.';
    } else {
      text = 'Both methods cost the same with these debts.';
    }
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Brand.greenSoft,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Brand.green.withValues(alpha: .3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.savings_outlined, color: Brand.green),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: const TextStyle(color: Brand.green, fontWeight: FontWeight.w700, height: 1.35))),
        ],
      ),
    );
  }
}

class _Legend extends StatelessWidget {
  const _Legend({required this.color, required this.label});
  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) => Row(children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: Brand.muted)),
      ]);
}

class _BalanceChart extends StatelessWidget {
  const _BalanceChart({required this.a, required this.s});
  final PayoffResult? a;
  final PayoffResult? s;

  List<FlSpot> _spots(PayoffResult r) => [for (var i = 0; i < r.history.length; i++) FlSpot(i.toDouble(), r.history[i])];

  @override
  Widget build(BuildContext context) {
    final results = [a, s].whereType<PayoffResult>().toList();
    final maxX = results.map((r) => r.history.length - 1).reduce(math.max).toDouble();
    final maxY = results.map((r) => r.history.first).reduce(math.max);
    return LineChart(
      LineChartData(
        minX: 0,
        maxX: math.max(1, maxX),
        minY: 0,
        maxY: maxY * 1.05,
        gridData: FlGridData(
          drawVerticalLine: false,
          getDrawingHorizontalLine: (_) => const FlLine(color: Brand.line, strokeWidth: 1),
        ),
        borderData: FlBorderData(show: false),
        lineTouchData: const LineTouchData(enabled: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(),
          rightTitles: const AxisTitles(),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 44,
              getTitlesWidget: (v, meta) => v == meta.max
                  ? const SizedBox.shrink()
                  : Text(compactMoney(v), style: const TextStyle(fontSize: 10, color: Brand.muted)),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 22,
              interval: maxX > 36 ? 12 : 6,
              getTitlesWidget: (v, meta) => Text(
                maxX > 36 ? '${(v / 12).round()}y' : '${v.round()}m',
                style: const TextStyle(fontSize: 10, color: Brand.muted),
              ),
            ),
          ),
        ),
        lineBarsData: [
          if (s != null) LineChartBarData(spots: _spots(s!), color: Brand.blue, barWidth: 3, dotData: const FlDotData(show: false)),
          if (a != null) LineChartBarData(spots: _spots(a!), color: Brand.green, barWidth: 3, dotData: const FlDotData(show: false)),
        ],
      ),
    );
  }
}
