سأقدم لك الملفات النهائية اللازمة لتحويل مشروع Flask إلى تطبيق Android باستخدام Buildozer + WebView، مع الحفاظ على جميع الميزات السابقة وتجنب الأخطاء.

---

1. main.py (المشغل الرئيسي)

```python
import threading
import time
import os
import sys
import json
import socket

import flask
from app import app as flask_app

# استيرادات Android عند التشغيل على الجهاز فقط
try:
    from android import mActivity
    from android.webkit import WebView
    from jnius import autoclass
    IS_ANDROID = True
except ImportError:
    IS_ANDROID = False

# متغير لمعرفة متى يصبح Flask جاهزاً
flask_ready = threading.Event()

def run_flask():
    """تشغيل Flask في خيط منفصل مع تنبيه عند الجاهزية."""
    # تعطيل reloader ومخرجات بدء التشغيل
    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    
    # إشارة جاهزية مخصصة
    @flask_app.before_first_request
    def notify_ready():
        flask_ready.set()
    
    flask_app.run(
        host='127.0.0.1',
        port=5000,
        debug=False,
        use_reloader=False,
        threaded=True
    )

def wait_for_flask(timeout=5):
    """انتظر حتى يصبح Flask جاهزاً أو ينتهي الوقت."""
    start = time.time()
    while not flask_ready.is_set() and (time.time() - start) < timeout:
        time.sleep(0.1)
    return flask_ready.is_set()

class CommissionApp:
    """تطبيق Android يستخدم WebView لعرض واجهة Flask."""
    
    def __init__(self):
        if not IS_ANDROID:
            print("هذا التطبيق يعمل فقط على أندرويد مع Kivy/Buildozer.")
            sys.exit(1)
        self.flask_thread = threading.Thread(target=run_flask, daemon=True)
        self.flask_thread.start()
        
        if not wait_for_flask(timeout=5):
            raise RuntimeError("تعذر بدء تشغيل خادم Flask.")
        
        # إعداد WebView
        PythonActivity = autoclass('org.kivy.android.PythonActivity')
        activity = PythonActivity.mActivity
        webview = WebView(activity)
        webview.getSettings().setJavaScriptEnabled(True)
        webview.getSettings().setDomStorageEnabled(True)
        webview.loadUrl('http://127.0.0.1:5000')
        activity.setContentView(webview)
        
        # التعامل مع زر الرجوع لإغلاق التطبيق
        from android.runnable import run_on_ui_thread
        @run_on_ui_thread
        def on_back_pressed():
            activity.onBackPressed()
        activity.onBackPressed = on_back_pressed

# نقطة الدخول لـ Kivy (Buildozer يستدعي هذا)
if __name__ == '__main__':
    if IS_ANDROID:
        CommissionApp()
        # إبقاء الخيط الرئيسي حياً
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
    else:
        # عند التشغيل على سطح المكتب، شغّل Flask مباشرة
        run_flask()
```

---

2. buildozer.spec (إعدادات البناء)

```ini
[app]
title = نظام العمولة
package.name = commissionsystem
package.domain = com.shinigami
source.dir = .
source.include_exts = py,html,css,js,png,jpg,jpeg,svg,db,sql,ttf
version = 1.0.0
requirements = python3,kivy,flask,jinja2,werkzeug,openpyxl,fpdf2,sqlite3,threading,hashlib,re,datetime,io,csv
android.permissions = INTERNET, WRITE_EXTERNAL_STORAGE, READ_EXTERNAL_STORAGE
android.api = 27
android.minapi = 21
android.ndk = 23b
android.sdk = 23
android.gradle = 7.4.2
android.arch = armeabi-v7a
android.allow_backup = True
android.presplash_color = #2563EB
android.add_java_package = True
android.add_src = libs
android.add_jar = libs
android.enable_androidx = True
android.use_deprecated_ndk = False
android.debug = True
android.release = False
optimize = 1
build_dir = .buildozer
bin_dir = bin
```

ملاحظات حول المتطلبات:

· sqlite3 مدمج مع Python، لكن أدرجناه للتوثيق.
· openpyxl و fpdf2 سيعملان على Android، لكن تأكد من وجود خط arial.ttf داخل static/fonts إذا استخدمته للـ PDF.
· تم إزالة الحزم غير الضرورية.

---

3. تعديل في app.py (مسار قاعدة البيانات المحمول)

لضمان أن قاعدة البيانات تُنشأ في مسار يسمح Android بالكتابة فيه (وليس داخل الحزمة للقراءة فقط)، أضف في بداية app.py قبل init_db():

```python
import os
import sys

# تحديد مسار قاعدة البيانات متوافق مع Android
if hasattr(sys, 'getandroidapilevel'):
    # نحن على Android: استخدم مسار خارجي قابل للكتابة
    from android.storage import app_storage_path
    DB_DIR = app_storage_path()
else:
    # سطح المكتب: استخدم مجلد المشروع الحالي
    DB_DIR = os.path.dirname(os.path.abspath(__file__))

# تحديث config.py بقاعدة بيانات في الموقع الصحيح
import config
config.DATABASE_PATH = os.path.join(DB_DIR, 'database.sql')
```

ثم تأكد من استيراد config.DATABASE_PATH في app.py واستخدامه عند إنشاء قاعدة البيانات (في database.py يستخدم config.DATABASE_PATH). هذا التعديل يضمن عدم فقدان البيانات عند تحديث التطبيق.

---

4. requirements.txt (لتثبيت Buildozer ومكتبات البناء)

```
flask
kivy
buildozer
openpyxl
fpdf2
```

تثبيت Buildozer على النظام:

```bash
pip install buildozer
sudo apt install -y git zip unzip openjdk-17-jdk python3-pip autoconf libtool pkg-config zlib1g-dev libncurses5-dev libncursesw5-dev libtinfo5 cmake libffi-dev libssl-dev
```

---

5. هيكل المشروع النهائي

```
commission-app/
├── main.py
├── buildozer.spec
├── app.py
├── config.py
├── database.py
├── models.py (إن وجد)
├── requirements.txt
├── templates/
│   ├── base.html
│   ├── ... (جميع القوالب)
├── static/
│   ├── css/
│   ├── js/
│   └── fonts/
│       └── arial.ttf (إذا استخدمته)
└── database.sql (ملف فارغ سيتم إنشاؤه)
```

---

6. بناء الـ APK

من داخل مجلد المشروع:

```bash
buildozer android debug
```

سيتم توليد APK في bin/commissionsystem-1.0.0-arm64-v8a-debug.apk (أو مشابه).

ملاحظة: البناء الأول سيستغرق وقتاً طويلاً (ساعة أو أكثر) لأنه سينزل Android SDK و NDK. تأكد من اتصال إنترنت مستقر.

بعد نجاح البناء، ثبّت الملف على هاتفك وستجد تطبيقك يعمل بواجهة الويب كاملة مع جميع الميزات السابقة (بما في ذلك التصدير إلى Excel/PDF إذا كانت المكتبات تعمل).
