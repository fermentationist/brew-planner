mkdir -p logs
mkdir -p logs/out
mkdir -p logs/err

filename=$(date '+%Y-%m-%d.%H:%M:%S')
cp console_log.txt "logs/out/$filename"
cp console_err.txt "logs/err/$filename"
