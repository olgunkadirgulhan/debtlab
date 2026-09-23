// Dart port of shared/debt_math.py and web/lib/debtMath.ts. Keep all three in
// sync: the videos, the site and the app must show the same numbers.
import 'dart:math' as math;

import 'models.dart';

const maxMonths = 600;

class PayoffResult {
  PayoffResult({required this.months, required this.totalInterest, required this.history, this.payoffOrder = const []});
  final int months;
  final double totalInterest;
  final List<double> history;
  final List<PayoffEvent> payoffOrder;
}

class PayoffEvent {
  PayoffEvent(this.name, this.month);
  final String name;
  final int month;
}

double round2(double x) => (x * 100).roundToDouble() / 100;

/// Fixed monthly payment on one balance. Null if the payment never covers interest.
PayoffResult? payoff(double balance, double apr, double payment) {
  final r = apr / 100 / 12;
  var months = 0;
  var interest = 0.0;
  final history = [round2(balance)];
  while (balance > 0.005 && months < maxMonths) {
    final i = balance * r;
    if (payment <= i) return null;
    interest += i;
    balance = math.max(0, balance + i - payment);
    months++;
    history.add(round2(balance));
  }
  return PayoffResult(months: months, totalInterest: round2(interest), history: history);
}

/// Pay every minimum, send the rest of [budget] to the first debt in priority order.
PayoffResult? multiPayoff(List<Debt> debts, double budget, Strategy strategy) {
  final ds = debts
      .where((d) => d.balance > 0)
      .map((d) => _Working(d.name, d.balance, d.apr, d.minPayment))
      .toList()
    ..sort((a, b) => strategy == Strategy.snowball ? a.balance.compareTo(b.balance) : b.apr.compareTo(a.apr));
  if (ds.isEmpty || budget < ds.fold<double>(0, (s, d) => s + d.min)) return null;

  var months = 0;
  var interest = 0.0;
  final history = [round2(ds.fold<double>(0, (s, d) => s + d.balance))];
  final order = <PayoffEvent>[];
  while (ds.any((d) => d.balance > 0.005) && months < maxMonths) {
    for (final d in ds) {
      if (d.balance > 0) {
        final i = d.balance * d.apr / 100 / 12;
        d.balance += i;
        interest += i;
      }
    }
    var left = budget;
    for (final d in ds) {
      if (d.balance > 0) {
        final pay = math.min(d.min, d.balance);
        d.balance -= pay;
        left -= pay;
      }
    }
    for (final d in ds) {
      if (left <= 0) break;
      if (d.balance > 0) {
        final pay = math.min(left, d.balance);
        d.balance -= pay;
        left -= pay;
      }
    }
    months++;
    for (final d in ds) {
      if (d.balance <= 0.005 && !order.any((o) => o.name == d.name)) {
        d.balance = 0;
        order.add(PayoffEvent(d.name, months));
      }
    }
    history.add(round2(ds.fold<double>(0, (s, d) => s + d.balance)));
  }
  if (months >= maxMonths) return null;
  return PayoffResult(months: months, totalInterest: round2(interest), history: history, payoffOrder: order);
}

class _Working {
  _Working(this.name, this.balance, this.apr, this.min);
  final String name;
  double balance;
  final double apr;
  final double min;
}

// ---------------------------------------------------------------------------
// Credit score estimate: same questions and weights as the website simulator.

class ScoreOption {
  const ScoreOption(this.label, this.value);
  final String label;
  final double value;
}

class ScoreQuestion {
  const ScoreQuestion(this.key, this.weight, this.label, this.options, this.tip);
  final String key;
  final double weight;
  final String label;
  final List<ScoreOption> options;
  final String tip;
}

const scoreQuestions = [
  ScoreQuestion('latePayments', 0.35, 'Late payments (30+ days) in the last 2 years?', [
    ScoreOption('None', 1),
    ScoreOption('1', 0.7),
    ScoreOption('2-3', 0.45),
    ScoreOption('4+ / collections', 0.15),
  ], 'Payment history carries the most weight. Autopay for at least the minimum helps prevent new late marks.'),
  ScoreQuestion('utilization', 0.30, 'Credit card balances vs. total limits?', [
    ScoreOption('Under 10%', 1),
    ScoreOption('10-29%', 0.85),
    ScoreOption('30-49%', 0.6),
    ScoreOption('50-74%', 0.4),
    ScoreOption('75%+', 0.2),
  ], 'Paying balances down before the statement closing date lowers the utilization that gets reported.'),
  ScoreQuestion('history', 0.15, 'Age of your oldest account?', [
    ScoreOption('Under 1 year', 0.3),
    ScoreOption('1-3 years', 0.55),
    ScoreOption('3-7 years', 0.75),
    ScoreOption('7+ years', 1),
  ], 'Keeping older accounts open (if they have no annual fee) helps the average age of your accounts.'),
  ScoreQuestion('newCredit', 0.10, 'Credit applications in the last 12 months?', [
    ScoreOption('None', 1),
    ScoreOption('1-2', 0.8),
    ScoreOption('3-4', 0.5),
    ScoreOption('5+', 0.25),
  ], 'Spacing out new applications limits hard inquiries, which usually fade after 12 months.'),
  ScoreQuestion('mix', 0.10, 'Types of credit you have?', [
    ScoreOption('Cards and loans', 1),
    ScoreOption('Cards only', 0.7),
    ScoreOption('Loans only', 0.6),
    ScoreOption('None yet', 0.3),
  ], 'Mix is a small factor. It is rarely worth opening a new account just to improve it.'),
];

class ScoreTier {
  const ScoreTier(this.min, this.label, this.color);
  final int min;
  final String label;
  final int color;
}

const scoreTiers = [
  ScoreTier(800, 'Exceptional', 0xFF16A34A),
  ScoreTier(740, 'Very good', 0xFF22C55E),
  ScoreTier(670, 'Good', 0xFF0F52BA),
  ScoreTier(580, 'Fair', 0xFFF59E0B),
  ScoreTier(300, 'Poor', 0xFFDC2626),
];

class ScoreEstimate {
  ScoreEstimate(this.score, this.tier, this.weakest);
  final int score;
  final ScoreTier tier;
  final ScoreQuestion weakest;
}

/// [answers] holds one option index per question, in [scoreQuestions] order.
ScoreEstimate estimateScore(List<int> answers) {
  var total = 0.0;
  ScoreQuestion weakest = scoreQuestions.first;
  var worstLoss = -1.0;
  for (var i = 0; i < scoreQuestions.length; i++) {
    final q = scoreQuestions[i];
    final v = q.options[answers[i]].value;
    total += q.weight * v;
    final loss = q.weight * (1 - v);
    if (loss > worstLoss) {
      worstLoss = loss;
      weakest = q;
    }
  }
  final score = (300 + 550 * total).round();
  final tier = scoreTiers.firstWhere((t) => score >= t.min);
  return ScoreEstimate(score, tier, weakest);
}
