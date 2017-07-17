find core -type f -name '*.js' -delete
find core -type f -name '*.js.map' -delete
find core -type f -name '*.d.ts' -delete
find db -type f -name '*.js' -delete
find db -type f -name '*.js.map' -delete
find db -type f -name '*.d.ts' -delete
rm -f common.js
rm -f common.js.map
rm -f common.d.ts
