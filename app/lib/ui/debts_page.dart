import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../core/format.dart';
import '../core/models.dart';
import '../core/store.dart';
import 'debt_form.dart';
import 'theme.dart';
import 'widgets.dart';

class DebtsPage extends StatelessWidget {
  const DebtsPage({super.key, required this.onShowPlan});
  final VoidCallback onShowPlan;

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final debts = store.debts;
    return Scaffold(
      appBar: AppBar(title: const Text('My debts')),
      floatingActionButton: debts.isEmpty
          ? null
          : FloatingActionButton.extended(
              onPressed: () => showDebtForm(context),
              icon: const Icon(Icons.add),
              label: const Text('Add debt'),
            ),
      body: debts.isEmpty
          ? EmptyState(
              icon: Icons.account_balance_wallet_outlined,
              title: 'Add your first debt',
              body: 'Credit cards, store cards, personal or car loans. Your data stays on this phone.',
              action: FilledButton.icon(
                onPressed: () => showDebtForm(context),
                icon: const Icon(Icons.add),
                label: const Text('Add a debt'),
              ),
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 100),
              children: [
                _Summary(store: store),
                const SizedBox(height: 12),
                _PlanTeaser(store: store, onTap: onShowPlan),
                const SizedBox(height: 20),
                const Text('Tap a debt to edit it', style: TextStyle(color: Brand.muted, fontSize: 13)),
                const SizedBox(height: 8),
                for (var i = 0; i < debts.length; i++) ...[
                  _DebtTile(debt: debts[i], color: Brand.series[i % Brand.series.length]),
                  const SizedBox(height: 8),
                ],
              ],
            ),
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary({required this.store});
  final AppStore store;

  @override
  Widget build(BuildContext context) {
    final debts = store.debts;
    final total = store.totalBalance;
    return SectionCard(
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Total debt', style: TextStyle(color: Brand.muted, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(money(total), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800)),
                ),
                const SizedBox(height: 6),
                Text('${debts.length} debt${debts.length == 1 ? '' : 's'} · ${money(store.totalMinimum)}/mo minimums',
                    style: const TextStyle(color: Brand.muted, fontSize: 13)),
              ],
            ),
          ),
          SizedBox(
            width: 104,
            height: 104,
            child: PieChart(
              PieChartData(
                sectionsSpace: 2,
                centerSpaceRadius: 30,
                sections: [
                  for (var i = 0; i < debts.length; i++)
                    PieChartSectionData(
                      value: debts[i].balance,
                      color: Brand.series[i % Brand.series.length],
                      radius: 20,
                      showTitle: false,
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PlanTeaser extends StatelessWidget {
  const _PlanTeaser({required this.store, required this.onTap});
  final AppStore store;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final plan = store.planFor(store.strategy);
    return Material(
      color: Brand.blue,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              const Icon(Icons.flag_rounded, color: Colors.white, size: 30),
              const SizedBox(width: 14),
              Expanded(
                child: plan == null
                    ? const Text('Your payments are too low to finish. Open your plan to adjust.',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600))
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Debt-free by ${payoffDate(plan.months)}',
                              style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
                          const SizedBox(height: 2),
                          Text('${store.strategy.label} plan · ${money(store.budget)}/mo',
                              style: const TextStyle(color: Colors.white70, fontSize: 13)),
                        ],
                      ),
              ),
              const Icon(Icons.chevron_right, color: Colors.white),
            ],
          ),
        ),
      ),
    );
  }
}

class _DebtTile extends StatelessWidget {
  const _DebtTile({required this.debt, required this.color});
  final Debt debt;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        onTap: () => showDebtForm(context, debt: debt),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: Container(width: 12, height: 40, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(6))),
        title: Text(debt.name, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text('${debt.apr.toStringAsFixed(debt.apr % 1 == 0 ? 0 : 2)}% APR · ${money(debt.minPayment)}/mo min'),
        trailing: Text(money(debt.balance), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
      ),
    );
  }
}
