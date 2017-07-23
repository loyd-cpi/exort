find core -type f -name '*.js' -delete
find core -type f -name '*.js.map' -delete
find core -type f -name '*.d.ts' -delete
find db -type f -name '*.js' -delete
find db -type f -name '*.js.map' -delete
find db -type f -name '*.d.ts' -delete
find web -type f -name '*.js' -delete
find web -type f -name '*.js.map' -delete
find web -type f -name '*.d.ts' -delete
find console -type f -name '*.js' -delete
find console -type f -name '*.js.map' -delete
find console -type f -name '*.d.ts' -delete
rm -f common.js
rm -f common.js.map
rm -f common.d.ts
