import 'package:debtlab/core/debt_math.dart';
import 'package:debtlab/core/models.dart';
import 'package:debtlab/core/store.dart';
import 'package:debtlab/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

final _debts = [
  Debt(id: '1', name: 'Store card', balance: 1200, apr: 18.99, minPayment: 35),
  Debt(id: '2', name: 'Visa', balance: 6800, apr: 27.49, minPayment: 170),
  Debt(id: '3', name: 'Car loan', balance: 9500, apr: 7.9, minPayment: 285),
];

void main() {
  group('debt math matches shared/debt_math.py', () {
    test('snowball', () {
      final r = multiPayoff(_debts, 690, Strategy.snowball)!;
      expect(r.months, 32);
      expect(r.totalInterest, 3915.62);
      expect(r.payoffOrder.first.name, 'Store card');
    });

    test('avalanche', () {
      final r = multiPayoff(_debts, 690, Strategy.avalanche)!;
      expect(r.months, 31);
      expect(r.totalInterest, 3707.77);
      expect(r.payoffOrder.first.name, 'Visa');
    });

    test('budget below minimums has no plan', () {
      expect(multiPayoff(_debts, 400, Strategy.avalanche), isNull);
    });

    test('single card payoff and never-ending payment', () {
      expect(payoff(5000, 24, 200)!.months, greaterThan(0));
      expect(payoff(5000, 24, 90), isNull); // interest is $100/mo
    });

    test('score estimate range', () {
      expect(estimateScore([0, 0, 3, 0, 0]).score, 850);
      expect(estimateScore([3, 4, 0, 3, 3]).tier.label, 'Poor');
    });
  });

  testWidgets('onboarding leads to the empty debts screen', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final store = await AppStore.load();
    await tester.pumpWidget(DebtLabApp(store: store));
    expect(find.text('All your debts in one place'), findsOneWidget);

    await tester.tap(find.text('Skip'));
    await tester.pumpAndSettle();
    expect(find.text('Add your first debt'), findsOneWidget);
  });

  testWidgets('plan tab shows a debt-free date once debts exist', (tester) async {
    SharedPreferences.setMockInitialValues({'onboarded': true});
    final store = await AppStore.load();
    for (final d in _debts) {
      store.upsertDebt(d);
    }
    store.extra = 200;
    await tester.pumpWidget(DebtLabApp(store: store));
    await tester.pumpAndSettle();
    expect(find.textContaining('Debt-free by'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.flag_outlined));
    await tester.pumpAndSettle();
    expect(find.textContaining('saves'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Payoff order'), 300, scrollable: find.byType(Scrollable).last);
    expect(find.text('Payoff order'), findsOneWidget);
  });
}
