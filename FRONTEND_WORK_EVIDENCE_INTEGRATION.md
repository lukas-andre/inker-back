# Flutter Integration Guide: Uploading Work Evidence

This guide provides instructions for the frontend team on how to integrate with the work evidence upload endpoint.

## Endpoint Details

- **URL**: `/agenda/event/:eventId/work-evidence`
- **HTTP Method**: `POST`
- **Content-Type**: `multipart/form-data`

## Authentication

- This endpoint requires a valid JWT Bearer token in the `Authorization` header.
- **Header**: `Authorization: Bearer <your_jwt_token>`

## Request Body

The request must be a `multipart/form-data` request containing the files to be uploaded.

- **Field name**: `files`
- **Type**: An array of files. Even for a single file, it must be sent as an array.

## Example with `dio` in Dart/Flutter

Here is a code snippet demonstrating how to upload one or more image files using the `dio` package in Flutter.

```dart
import 'package:dio/dio.dart';
import 'dart:io';

Future<void> uploadWorkEvidence(String eventId, List<File> imageFiles, String token) async {
  final dio = Dio();
  
  // Create a list of MultipartFile objects from the File objects
  List<MultipartFile> filesToUpload = [];
  for (var file in imageFiles) {
    String fileName = file.path.split('/').last;
    filesToUpload.add(await MultipartFile.fromFile(file.path, filename: fileName));
  }

  // Create the FormData object
  FormData formData = FormData.fromMap({
    'files': filesToUpload,
  });

  try {
    Response response = await dio.post(
      'https://your-api-domain.com/agenda/event/$eventId/work-evidence',
      data: formData,
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'multipart/form-data',
        },
      ),
      onSendProgress: (int sent, int total) {
        print('Upload progress: ${(sent / total * 100).toStringAsFixed(2)}%');
      },
    );

    if (response.statusCode == 200) {
      print('Upload successful!');
      print('Response data: ${response.data}');
    } else {
      print('Upload failed with status code: ${response.statusCode}');
    }
  } on DioError catch (e) {
    print('An error occurred: ${e.message}');
    if (e.response != null) {
      print('Error response data: ${e.response?.data}');
    }
  }
}

// How to use it:
//
// File myImage = File('/path/to/your/image.jpg');
// String eventId = 'your-event-uuid-here';
// String userToken = 'your-jwt-token-here';
//
// await uploadWorkEvidence(eventId, [myImage], userToken);
```

## Success Response

- **Status Code**: `200 OK`
- **Body**: The updated `AgendaEvent` object, which will now include the `workEvidence` field populated with metadata about the uploaded files.

```json
{
  "id": "your-event-uuid-here",
  "status": "waiting_for_review",
  "workEvidence": {
    "count": 1,
    "metadata": [
      {
        "url": "https://your-cdn.com/agenda/your-agenda-id/event/your-event-uuid-here/work-evidence/file_0",
        "size": 12345,
        "type": "image/jpeg",
        "originalname": "tattoo_photo.jpg",
        "position": 0
      }
    ]
  },
  // ... other event properties
}
```

## Error Responses

- `401 Unauthorized`: The JWT token is missing, invalid, or expired.
- `403 Forbidden`: The authenticated user is not an artist or is not the artist assigned to the event.
- `404 Not Found`: The specified `eventId` does not exist.
- `400 Bad Request`: The event is not in a state where work evidence can be added (e.g., it's already in `AFTERCARE_PERIOD`).

---

## Deleting Work Evidence

This endpoint allows the assigned artist to delete all previously uploaded work evidence for an event. This action is only possible before the event moves to a final state (e.g., `AFTERCARE_PERIOD`).

### Endpoint Details

-   **URL**: `/agenda/event/:eventId/work-evidence`
-   **HTTP Method**: `DELETE`

### Authentication

-   This endpoint requires a valid JWT Bearer token in the `Authorization` header.
-   **Header**: `Authorization: Bearer <your_jwt_token>`

### Example with `dio` in Dart/Flutter

```dart
import 'package:dio/dio.dart';

Future<void> deleteWorkEvidence(String eventId, String token) async {
  final dio = Dio();

  try {
    Response response = await dio.delete(
      'https://your-api-domain.com/agenda/event/$eventId/work-evidence',
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
        },
      ),
    );

    if (response.statusCode == 200) {
      print('Deletion successful!');
      print('Response data: ${response.data}');
    } else {
      print('Deletion failed with status code: ${response.statusCode}');
    }
  } on DioError catch (e) {
    print('An error occurred: ${e.message}');
    if (e.response != null) {
      print('Error response data: ${e.response?.data}');
    }
  }
}

// How to use it:
//
// String eventId = 'your-event-uuid-here';
// String userToken = 'your-jwt-token-here';
//
// await deleteWorkEvidence(eventId, userToken);
```

### Success Response

-   **Status Code**: `200 OK`
-   **Body**: The updated `AgendaEvent` object where the `workEvidence` field is now `null`.

```json
{
  "id": "your-event-uuid-here",
  "status": "completed",
  "workEvidence": null,
  // ... other event properties
}
```

### Error Responses

-   `401 Unauthorized`: The JWT token is missing, invalid, or expired.
-   `403 Forbidden`: The authenticated user is not an artist or is not the artist assigned to the event.
-   `404 Not Found`: The specified `eventId` does not exist.
-   `400 Bad Request`: The event is not in a state where work evidence can be deleted. 