# API Request: Update Lock Name Endpoint

## Required Endpoint

**Method:** `PUT`  
**URL:** `/api/locks/{id}`  
**Content-Type:** `application/json`

## Request Body
```json
{
  "name": "New Lock Name"
}
```

## Response Format
```json
{
  "status": "success",
  "message": "Lock name updated successfully",
  "data": {
    "id": 1,
    "name": "New Lock Name",
    "location": "Front Door",
    "updated_at": "2025-11-16 13:39:00"
  }
}
```

## Error Response
```json
{
  "status": "error",
  "message": "Lock not found"
}
```

## CodeIgniter 4 Implementation

### Route (app/Config/Routes.php)
```php
$routes->put('api/locks/(:num)', 'Api\LocksController::update/$1');
```

### Controller Method (app/Controllers/Api/LocksController.php)
```php
public function update($id)
{
    $json = $this->request->getJSON(true);
    
    if (!isset($json['name']) || empty(trim($json['name']))) {
        return $this->response->setJSON([
            'status' => 'error',
            'message' => 'Lock name is required'
        ])->setStatusCode(400);
    }
    
    $lockModel = new \App\Models\LockModel();
    $lock = $lockModel->find($id);
    
    if (!$lock) {
        return $this->response->setJSON([
            'status' => 'error',
            'message' => 'Lock not found'
        ])->setStatusCode(404);
    }
    
    $updateData = [
        'name' => trim($json['name']),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    if ($lockModel->update($id, $updateData)) {
        $updatedLock = $lockModel->find($id);
        return $this->response->setJSON([
            'status' => 'success',
            'message' => 'Lock name updated successfully',
            'data' => $updatedLock
        ]);
    }
    
    return $this->response->setJSON([
        'status' => 'error',
        'message' => 'Failed to update lock name'
    ])->setStatusCode(500);
}
```

## Frontend Usage
Once implemented, the frontend will call:
```javascript
await api.put(`/locks/${lockId}`, { name: newName })
```
