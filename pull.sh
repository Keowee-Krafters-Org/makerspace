directory=$1
if [ -z "$directory" ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi      
if [ ! -d "$directory" ]; then
    echo "Directory $directory does not exist."
    exit 1
fi  
cd "$directory" || exit
clasp pull
if [ $? -ne 0 ]; then
    echo "Failed to pull clasp project in $directory."
    exit 1
fi
echo "Successfully pulled clasp project in $directory."
# Return to the original directory
cd - || exit
echo "Returned to the original directory."
