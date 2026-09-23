import 'package:flutter/material.dart';

class Brand {
  static const blue = Color(0xFF0F52BA);
  static const blueDark = Color(0xFF0B3F91);
  static const blueSoft = Color(0xFFEAF1FC);
  static const green = Color(0xFF16A34A);
  static const greenSoft = Color(0xFFE8F7EE);
  static const red = Color(0xFFDC2626);
  static const ink = Color(0xFF0F172A);
  static const muted = Color(0xFF64748B);
  static const line = Color(0xFFE2E8F0);
  static const page = Color(0xFFF6F8FB);

  /// Colors for debts in charts, in list order.
  static const series = [
    Color(0xFF0F52BA),
    Color(0xFF16A34A),
    Color(0xFFF59E0B),
    Color(0xFF8B5CF6),
    Color(0xFFEC4899),
    Color(0xFF14B8A6),
    Color(0xFFEF4444),
    Color(0xFF64748B),
  ];
}

ThemeData buildTheme() {
  final scheme = ColorScheme.fromSeed(seedColor: Brand.blue, primary: Brand.blue, surface: Colors.white);
  final base = ThemeData(colorScheme: scheme, useMaterial3: true, scaffoldBackgroundColor: Brand.page);
  return base.copyWith(
    textTheme: base.textTheme.apply(bodyColor: Brand.ink, displayColor: Brand.ink),
    appBarTheme: const AppBarTheme(
      backgroundColor: Brand.page,
      foregroundColor: Brand.ink,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(color: Brand.ink, fontSize: 22, fontWeight: FontWeight.w800),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: const BorderSide(color: Brand.line)),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Brand.line)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Brand.line)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Brand.blue, width: 2)),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: Colors.white,
      indicatorColor: Brand.blueSoft,
      labelTextStyle: WidgetStateProperty.all(const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
    ),
  );
}
