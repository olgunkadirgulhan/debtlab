import 'package:flutter/material.dart';

import '../core/store.dart';
import 'theme.dart';

class _Slide {
  const _Slide(this.icon, this.title, this.body);
  final IconData icon;
  final String title;
  final String body;
}

const _slides = [
  _Slide(Icons.list_alt_rounded, 'All your debts in one place',
      'Add your cards and loans with their balance, APR and minimum payment. Everything stays on your phone.'),
  _Slide(Icons.flag_rounded, 'See your debt-free date',
      'Pick Snowball or Avalanche and get a month-by-month plan, including the order each debt gets paid off.'),
  _Slide(Icons.savings_rounded, 'Find the interest you could save',
      'Compare both methods and see how a little extra each month could change your timeline.'),
];

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _controller = PageController();
  int _page = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _next() {
    if (_page < _slides.length - 1) {
      _controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
    } else {
      StoreScope.of(context).completeOnboarding();
    }
  }

  @override
  Widget build(BuildContext context) {
    final last = _page == _slides.length - 1;
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => StoreScope.of(context).completeOnboarding(),
                child: const Text('Skip'),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _slides.length,
                onPageChanged: (i) => setState(() => _page = i),
                itemBuilder: (_, i) {
                  final s = _slides[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(color: Brand.blueSoft, borderRadius: BorderRadius.circular(40)),
                          child: Icon(s.icon, size: 72, color: Brand.blue),
                        ),
                        const SizedBox(height: 40),
                        Text(s.title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, height: 1.15)),
                        const SizedBox(height: 14),
                        Text(s.body, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, color: Brand.muted, height: 1.5)),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _slides.length,
                (i) => AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: i == _page ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(color: i == _page ? Brand.blue : Brand.line, borderRadius: BorderRadius.circular(4)),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
              child: FilledButton(onPressed: _next, child: Text(last ? 'Get started' : 'Next')),
            ),
          ],
        ),
      ),
    );
  }
}
