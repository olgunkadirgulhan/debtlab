import 'dart:convert';

import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'debt_math.dart';
import 'models.dart';

/// App state, saved on the device only. No account, nothing leaves the phone.
class AppStore extends ChangeNotifier {
  AppStore._(this._prefs) {
    final raw = _prefs.getString(_kDebts);
    if (raw != null) {
      _debts = (jsonDecode(raw) as List).map((e) => Debt.fromJson(e as Map<String, dynamic>)).toList();
    }
    _extra = _prefs.getDouble(_kExtra) ?? 100;
    _strategy = Strategy.values[_prefs.getInt(_kStrategy) ?? 1];
    _onboarded = _prefs.getBool(_kOnboarded) ?? false;
    _scoreAnswers = _prefs.getStringList(_kScore)?.map(int.parse).toList() ?? [0, 2, 2, 1, 1];
  }

  static const _kDebts = 'debts', _kExtra = 'extra', _kStrategy = 'strategy', _kOnboarded = 'onboarded', _kScore = 'score';

  static Future<AppStore> load() async => AppStore._(await SharedPreferences.getInstance());

  final SharedPreferences _prefs;
  List<Debt> _debts = [];
  double _extra = 100;
  Strategy _strategy = Strategy.avalanche;
  bool _onboarded = false;
  List<int> _scoreAnswers = [0, 2, 2, 1, 1];

  List<Debt> get debts => List.unmodifiable(_debts);
  double get extra => _extra;
  Strategy get strategy => _strategy;
  bool get onboarded => _onboarded;
  List<int> get scoreAnswers => List.unmodifiable(_scoreAnswers);

  double get totalBalance => _debts.fold(0, (s, d) => s + d.balance);
  double get totalMinimum => _debts.fold(0, (s, d) => s + d.minPayment);
  double get budget => totalMinimum + _extra;

  PayoffResult? planFor(Strategy s) => multiPayoff(_debts, budget, s);

  void upsertDebt(Debt d) {
    final i = _debts.indexWhere((x) => x.id == d.id);
    if (i >= 0) {
      _debts[i] = d;
    } else {
      _debts.add(d);
    }
    _saveDebts();
  }

  void removeDebt(String id) {
    _debts.removeWhere((d) => d.id == id);
    _saveDebts();
  }

  set extra(double v) {
    _extra = v < 0 ? 0 : v;
    _prefs.setDouble(_kExtra, _extra);
    notifyListeners();
  }

  set strategy(Strategy s) {
    _strategy = s;
    _prefs.setInt(_kStrategy, s.index);
    notifyListeners();
  }

  void completeOnboarding() {
    _onboarded = true;
    _prefs.setBool(_kOnboarded, true);
    notifyListeners();
  }

  void setScoreAnswer(int question, int option) {
    _scoreAnswers[question] = option;
    _prefs.setStringList(_kScore, _scoreAnswers.map((e) => '$e').toList());
    notifyListeners();
  }

  void _saveDebts() {
    _prefs.setString(_kDebts, jsonEncode(_debts.map((d) => d.toJson()).toList()));
    notifyListeners();
  }
}

/// Makes the store reachable from any widget: `StoreScope.of(context)`.
class StoreScope extends InheritedNotifier<AppStore> {
  const StoreScope({super.key, required AppStore store, required super.child}) : super(notifier: store);

  static AppStore of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<StoreScope>()!.notifier!;
}
