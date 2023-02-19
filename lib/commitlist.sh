git config --local user.email "craig@gormantec.com"
git config --local user.name "gormantec"
git add ./applist.json
git commit -m "Add changes" -a
git pull --rebase
git push