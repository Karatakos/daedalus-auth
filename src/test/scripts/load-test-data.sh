aws dynamodb batch-write-item \
    --request-items file://dynamo-mock-artifacts.json \
    --return-consumed-capacity INDEXES \
    --return-item-collection-metrics SIZE

aws dynamodb batch-write-item \
    --request-items file://dynamo-mock-users.json \
    --return-consumed-capacity INDEXES \
    --return-item-collection-metrics SIZE