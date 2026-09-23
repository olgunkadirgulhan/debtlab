import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/format.dart';
import '../core/models.dart';
import '../core/store.dart';
import 'theme.dart';

/// Add a debt (debt == null) or edit an existing one.
Future<void> showDebtForm(BuildContext context, {Debt? debt}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    showDragHandle: true,
    backgroundColor: Colors.white,
    builder: (_) => StoreScope(store: StoreScope.of(context), child: _DebtForm(debt: debt)),
  );
}

class _DebtForm extends StatefulWidget {
  const _DebtForm({this.debt});
  final Debt? debt;

  @override
  State<_DebtForm> createState() => _DebtFormState();
}

class _DebtFormState extends State<_DebtForm> {
  final _form = GlobalKey<FormState>();
  late final _name = TextEditingController(text: widget.debt?.name ?? '');
  late final _balance = TextEditingController(text: _num(widget.debt?.balance));
  late final _apr = TextEditingController(text: _num(widget.debt?.apr));
  late final _min = TextEditingController(text: _num(widget.debt?.minPayment));

  static String _num(double? v) => v == null ? '' : (v == v.roundToDouble() ? v.toStringAsFixed(0) : '$v');

  @override
  void dispose() {
    for (final c in [_name, _balance, _apr, _min]) {
      c.dispose();
    }
    super.dispose();
  }

  double? _parse(String s) => double.tryParse(s.replaceAll(',', '.').replaceAll(r'$', '').trim());

  void _save() {
    if (!_form.currentState!.validate()) return;
    final store = StoreScope.of(context);
    store.upsertDebt(Debt(
      id: widget.debt?.id ?? DateTime.now().microsecondsSinceEpoch.toString(),
      name: _name.text.trim(),
      balance: _parse(_balance.text)!,
      apr: _parse(_apr.text)!,
      minPayment: _parse(_min.text)!,
    ));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final editing = widget.debt != null;
    final numbers = [FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]'))];
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 0, 20, MediaQuery.viewInsetsOf(context).bottom + 20),
      child: Form(
        key: _form,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(editing ? 'Edit debt' : 'Add a debt', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 18),
              TextFormField(
                controller: _name,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(labelText: 'Name', hintText: 'e.g. Visa, Car loan'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Give it a name' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _balance,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: numbers,
                decoration: const InputDecoration(labelText: 'Current balance', prefixText: r'$ '),
                validator: (v) => (_parse(v ?? '') ?? 0) <= 0 ? 'Enter the balance' : null,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _apr,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      inputFormatters: numbers,
                      decoration: const InputDecoration(labelText: 'APR', suffixText: '%'),
                      validator: (v) {
                        final x = _parse(v ?? '');
                        return (x == null || x < 0 || x > 100) ? '0-100' : null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _min,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      inputFormatters: numbers,
                      decoration: const InputDecoration(labelText: 'Min. payment', prefixText: r'$ '),
                      validator: (v) {
                        final m = _parse(v ?? '') ?? 0;
                        if (m <= 0) return 'Required';
                        final b = _parse(_balance.text) ?? 0;
                        final a = _parse(_apr.text) ?? 0;
                        final interest = b * a / 100 / 12;
                        return m <= interest ? 'Over ${money(interest)}' : null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Text('The minimum must be more than one month of interest, or the balance never goes down.',
                  style: TextStyle(fontSize: 12, color: Brand.muted)),
              const SizedBox(height: 20),
              FilledButton(onPressed: _save, child: Text(editing ? 'Save changes' : 'Add debt')),
              if (editing) ...[
                const SizedBox(height: 8),
                TextButton.icon(
                  onPressed: () {
                    StoreScope.of(context).removeDebt(widget.debt!.id);
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.delete_outline, color: Brand.red),
                  label: const Text('Delete debt', style: TextStyle(color: Brand.red)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
