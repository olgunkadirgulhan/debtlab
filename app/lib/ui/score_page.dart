import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../core/debt_math.dart';
import '../core/store.dart';
import 'theme.dart';
import 'widgets.dart';

class ScorePage extends StatelessWidget {
  const ScorePage({super.key});

  @override
  Widget build(BuildContext context) {
    final store = StoreScope.of(context);
    final answers = store.scoreAnswers;
    final est = estimateScore(answers);
    final tierColor = Color(est.tier.color);

    return Scaffold(
      appBar: AppBar(title: const Text('Score simulator')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        children: [
          SectionCard(
            child: Column(
              children: [
                const Text('Estimated score', style: TextStyle(color: Brand.muted, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                SizedBox(
                  width: 220,
                  height: 120,
                  child: CustomPaint(
                    painter: _Gauge(progress: (est.score - 300) / 550, color: tierColor),
                    child: Align(
                      alignment: const Alignment(0, .9),
                      child: Text('${est.score}', style: const TextStyle(fontSize: 46, fontWeight: FontWeight.w800)),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(color: tierColor, borderRadius: BorderRadius.circular(20)),
                  child: Text(est.tier.label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                ),
                const SizedBox(height: 14),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: Brand.page, borderRadius: BorderRadius.circular(14)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Biggest opportunity', style: TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(est.weakest.tip, style: const TextStyle(color: Brand.muted, height: 1.4)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          for (var qi = 0; qi < scoreQuestions.length; qi++) ...[
            SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${qi + 1}. ${scoreQuestions[qi].label}', style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (var oi = 0; oi < scoreQuestions[qi].options.length; oi++)
                        ChoiceChip(
                          label: Text(scoreQuestions[qi].options[oi].label),
                          selected: answers[qi] == oi,
                          onSelected: (_) => store.setScoreAnswer(qi, oi),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],
          const Text(
            'Educational estimate based on the publicly described weight of each factor. It is not your actual FICO® Score '
            'or VantageScore®, and lenders may see a different number.',
            style: TextStyle(fontSize: 12, color: Brand.muted, height: 1.4),
          ),
          const DisclaimerText(),
        ],
      ),
    );
  }
}

class _Gauge extends CustomPainter {
  _Gauge({required this.progress, required this.color});
  final double progress;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromCircle(center: Offset(size.width / 2, size.height), radius: size.width / 2 - 12);
    final base = Paint()
      ..color = Brand.line
      ..style = PaintingStyle.stroke
      ..strokeWidth = 16
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(rect, math.pi, math.pi, false, base);
    canvas.drawArc(rect, math.pi, math.pi * progress.clamp(0.0, 1.0), false, base..color = color);
  }

  @override
  bool shouldRepaint(_Gauge old) => old.progress != progress || old.color != color;
}
