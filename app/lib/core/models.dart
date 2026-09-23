enum Strategy { snowball, avalanche }

extension StrategyLabel on Strategy {
  String get label => this == Strategy.snowball ? 'Snowball' : 'Avalanche';
  String get rule => this == Strategy.snowball ? 'Smallest balance first' : 'Highest APR first';
}

class Debt {
  Debt({required this.id, required this.name, required this.balance, required this.apr, required this.minPayment});

  final String id;
  final String name;
  final double balance;
  final double apr;
  final double minPayment;

  Debt copyWith({String? name, double? balance, double? apr, double? minPayment}) => Debt(
        id: id,
        name: name ?? this.name,
        balance: balance ?? this.balance,
        apr: apr ?? this.apr,
        minPayment: minPayment ?? this.minPayment,
      );

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'balance': balance, 'apr': apr, 'min': minPayment};

  factory Debt.fromJson(Map<String, dynamic> j) => Debt(
        id: j['id'] as String,
        name: j['name'] as String,
        balance: (j['balance'] as num).toDouble(),
        apr: (j['apr'] as num).toDouble(),
        minPayment: (j['min'] as num).toDouble(),
      );
}
