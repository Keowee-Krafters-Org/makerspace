# Push the project to the remote repository
# Usage: ./push.sh <project_directory>
#!/bin/bash     
# Check if the correct number of arguments is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <project_directory>"
    exit 1
fi  
MODULE_DIR=$1    
# Push the clasp project to the remote repository
cd "$MODULE_DIR" || { echo "Directory $MODULE_DIR does not exist."; exit 1; }   
clasp push 
# Check if the clasp push command was successful
if [ $? -ne 0 ]; then
    echo "Failed to push the clasp project in $MODULE_DIR. Please check your clasp installation and project configuration."
    exit 1
fi  
echo "Successfully pushed the clasp project in $MODULE_DIR."
# Exit the script successfully  
exit 0
