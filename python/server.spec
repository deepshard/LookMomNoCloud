# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all


datas = []
binaries = []
hiddenimports = []

for pkg in ['mlc_llm', 'tvm', 'aiosqlite']:
    d,b,h = collect_all(pkg)
    datas += d
    binaries += b
    hiddenimports += h

print("----- BINARIES -----")
for b in binaries:
    print(b)
print("--------------")

a = Analysis(
    ['server.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=["readline"],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='server',
    debug=True,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    upx_exclude=[],
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity="8AF734C4A67D2DAFFFC986F57B9D9CCBDE4ABB59",
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='server',
)

