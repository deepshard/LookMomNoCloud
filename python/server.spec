# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all
import os
import sys
import site

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

server_analysis = Analysis(
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

mlc_serve_analysis = Analysis(
    [site.getusersitepackages() + '/mlc_llm/cli/serve.py'],
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

server_exe = EXE(
    PYZ(server_analysis.pure),
    server_analysis.scripts,
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

mlc_llm_serve_exe = EXE(
    PYZ(mlc_serve_analysis.pure),
    mlc_serve_analysis.scripts,
    [],
    exclude_binaries=True,
    name='mlc_llm_serve',
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
    server_exe,
    mlc_llm_serve_exe,
    server_analysis.binaries,
    server_analysis.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='server',
)