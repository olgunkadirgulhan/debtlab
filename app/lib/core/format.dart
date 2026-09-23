import 'package:intl/intl.dart';

final _money = NumberFormat.currency(locale: 'en_US', symbol: r'$', decimalDigits: 0);

String money(num x) => _money.format(x.round());

String duration(int months) {
  final y = months ~/ 12;
  final m = months % 12;
  final ys = '$y year${y == 1 ? '' : 's'}';
  final ms = '$m month${m == 1 ? '' : 's'}';
  if (y > 0 && m > 0) return '$ys, $ms';
  return y > 0 ? ys : ms;
}

String payoffDate(int months, [DateTime? from]) {
  final f = from ?? DateTime.now();
  return DateFormat('MMMM yyyy', 'en_US').format(DateTime(f.year, f.month + months, 1));
}

String compactMoney(num v) {
  if (v >= 1000) {
    final k = v / 1000;
    final s = k >= 10 ? k.toStringAsFixed(0) : k.toStringAsFixed(1).replaceAll('.0', '');
    return '\$${s}K';
  }
  return '\$${v.round()}';
}
