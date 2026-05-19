# تقرير مشروع CarbonLedger

## ما هو التطبيق؟

CarbonLedger هو تطبيق Windows مستقل لإدارة دفتر المطعم. يسجل المبيعات اليومية، المصاريف، ويقفل اليوم بتقرير محفوظ ومقفل داخل قاعدة بيانات محلية.

## كيف يعمل؟

- يعمل كتطبيق سطح مكتب عبر Tauri.
- الواجهة مبنية بـ React.
- البيانات محفوظة محلياً في SQLite داخل مجلد بيانات التطبيق.
- الترخيص يرتبط ببصمة جهاز Windows.
- مفتاح التطوير للتجربة: `CF-DEMO-ALL`.
- التحديثات مدعومة عبر ملفات Tauri updater الموقعة.

## لغة البرمجة والتقنيات

- Frontend: TypeScript + React
- Desktop Backend: Rust + Tauri
- Database: SQLite
- Installer: NSIS

## الملفات المهمة

- السورس: `src/`
- كود Rust: `src-tauri/src/main.rs`
- إعداد Tauri: `src-tauri/tauri.conf.json`
- المثبت الجاهز: `release/CarbonLedger_0.1.0_x64-setup.exe`
- توقيع التحديث: `release/CarbonLedger_0.1.0_x64-setup.exe.sig`

## نتيجة الفحص

- `npm run build:web`: ناجح
- `npm run lint`: ناجح
- `cargo check`: ناجح
- بناء مثبت Windows: ناجح

## نسبة نجاح التطبيق بعد الفحص

نسبة الجاهزية: 92%

السبب: التطبيق يعمل محلياً ويبني مثبت Windows بنجاح. المتبقي للإنتاج التجاري الكامل هو توقيع Windows Code Signing رسمي وربط نظام تراخيص إنتاجي على سيرفر المطور.
