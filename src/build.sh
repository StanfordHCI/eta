echo "Compressing Javascript..."
./scripts/compressjs.sh js/imagesloaded.pkgd.min.js js/jquery.hotkeys.js js/jquery.placeholder.js js/primitives-helpers.js js/primitives-base.js ../releases/eta-latest.js
echo "Compressing CSS..."
cleancss -o ../releases/eta-latest.css css/default.css
echo "Compressing Python files..."
rm ../releases/process.py
pyminifier ./py/process.py > ../releases/process.py
rm ../releases/generate_json.py
pyminifier ./py/generate_json.py > ../releases/generate_json.py
echo "Done!"
