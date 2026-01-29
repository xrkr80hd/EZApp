<?php
// Removed: authentication is disabled site-wide. Always return 410 Gone.
http_response_code(410);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'message' => 'Endpoint removed']);
exit;
?>
