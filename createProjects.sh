# Create the clasp project and set up the necessary files
# Usage: ./createProject.sh <project_name>        
#!/bin/bash
# Check if the correct number of arguments is provided
create_clasp_project() {
    local PROJECT_NAME=$1
    local PROJECT_ID=$2

    # Create the clasp project
    clasp create --title "$PROJECT_NAME" --rootDir ./src --scriptId "$PROJECT_ID"
    
    # Check if the clasp create command was successful
    if [ $? -ne 0 ]; then
        echo "Failed to create the clasp project for $PROJECT_NAME. Please check your clasp installation and project ID."
        exit 1
    fi
}

# Check if the correct number of arguments is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <workspace_directory>"
    exit 1
fi

WORKSPACE_DIR=$1

# Iterate through each module in the workspace directory
for MODULE_DIR in "$WORKSPACE_DIR"/*; do
    if [ -d "$MODULE_DIR" ]; then
        MODULE_NAME=$(basename "$MODULE_DIR")
        PROJECT_ID=$(cat "$MODULE_DIR/project_id.txt") # Assuming project_id.txt contains the script ID
        create_clasp_project "$MODULE_NAME" "$PROJECT_ID"
    fi
done
