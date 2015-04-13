echo "Compressing Javascript..."
./scripts/compressjs.sh js/imagesloaded.pkgd.min.js js/jquery.hotkeys.js js/jquery.placeholder.js js/primitives-helpers.js js/primitives-base.js ../releases/eta-latest.js
echo "Compressing CSS..."
cleancss -o ../releases/eta-latest.css css/default.css
echo "Compressing process.py..."
rm ../releases/process.py
pyminifier ./py/process.py > ../releases/process.py
echo "Done!"
