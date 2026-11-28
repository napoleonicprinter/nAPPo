<?php
// Show clear error message instead of blank 500 if anything fails
ini_set('display_errors', '1');
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ============================================================================
// 1. CONFIGURATION — Fill in your Patreon details from:
//    https://www.patreon.com/portal/registration/register-clients
// ============================================================================
define('PATREON_CLIENT_ID',     'PASTE_YOUR_CLIENT_ID_HERE');
define('PATREON_CLIENT_SECRET', 'PASTE_YOUR_CLIENT_SECRET_HERE');

// Exact URL to this script in your new Patreon folder on cPanel
// (Make sure this exact URL is added to "Redirect URIs" in your Patreon Client settings)
define('PATREON_REDIRECT_URI',  'https://www.regimientosdeamerica.com/YOUR_NEW_PATREON_FOLDER/patreon-gate.php');

// Your public Patreon creator page (for the "Join on Patreon" link)
define('PATREON_CREATOR_URL',   'https://www.patreon.com/YOUR_PATREON_PAGE');

// Minimum monthly pledge in cents required for access:
// - Set to 0 to allow BOTH Free Members (Free subscribers / followers) AND Paid Patrons.
// - Set to 100 ($1/€1+) to allow ONLY Paid Patrons.
define('MIN_PLEDGE_CENTS',      0);
define('ALLOW_FREE_MEMBERS',    true);

// How long (in seconds) a verified session stays logged in before re-checking with Patreon (default: 24 hours)
define('SESSION_TTL_SECONDS',   86400);

// Built-in Leech Protection (Anti-Account Sharing per Patreon User ID):
// Maximum number of different IP addresses allowed per Patreon account within LEECH_WINDOW_SECONDS
define('MAX_IPS_PER_PATRON',    4);
define('LEECH_WINDOW_SECONDS',  7200); // 2 hours (same as cPanel Leech Protect)
define('BLOCKED_REDIRECT_URL',  'https://www.regimientosdeamerica.com/assets/blocked.png');
// ============================================================================

// Handle Logout (?logout=1)
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'));
    exit;
}

// ----------------------------------------------------------------------------
// 2. HANDLE PATREON OAUTH CALLBACK (?code=...)
// ----------------------------------------------------------------------------
if (isset($_GET['code'])) {
    $code = $_GET['code'];

    $ch = curl_init('https://www.patreon.com/api/oauth2/token');
    curl_setopt_array($ch, array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query(array(
            'code'          => $code,
            'grant_type'    => 'authorization_code',
            'client_id'     => PATREON_CLIENT_ID,
            'client_secret' => PATREON_CLIENT_SECRET,
            'redirect_uri'  => PATREON_REDIRECT_URI,
        )),
        CURLOPT_HTTPHEADER     => array('Content-Type: application/x-www-form-urlencoded'),
    ));
    $tokenResponse = curl_exec($ch);
    curl_close($ch);

    $tokenData = json_decode($tokenResponse, true);
    if (empty($tokenData['access_token'])) {
        showLoginScreen('Could not verify Patreon login token. Please try again.');
    }

    $apiUrl = 'https://www.patreon.com/api/oauth2/v2/identity'
            . '?include=memberships,campaign'
            . '&fields' . urlencode('[user]') . '=full_name,email'
            . '&fields' . urlencode('[member]') . '=patron_status,currently_entitled_amount_cents,is_follower';

    $ch = curl_init($apiUrl);
    curl_setopt_array($ch, array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => array(
            'Authorization: Bearer ' . $tokenData['access_token'],
            'User-Agent: nAPPoTrails-Patreon-Gate/1.0',
        ),
    ));
    $identityResponse = curl_exec($ch);
    curl_close($ch);

    $identityData = json_decode($identityResponse, true);
    $patreonUserId = isset($identityData['data']['id']) ? $identityData['data']['id'] : null;

    $isAuthorized = false;

    // 1. If the logged-in user is the Campaign Creator themselves, always grant access
    if (!empty($identityData['data']['relationships']['campaign']['data']['id'])) {
        $isAuthorized = true;
    }

    // 2. Check campaign memberships (Paid Patrons & Free Members)
    // Note: Patreon API v2 only returns 'member' records inside 'included' for your own campaign!
    if (!$isAuthorized && !empty($identityData['included']) && is_array($identityData['included'])) {
        foreach ($identityData['included'] as $item) {
            $type = isset($item['type']) ? $item['type'] : '';
            if ($type === 'member') {
                $status     = isset($item['attributes']['patron_status']) ? $item['attributes']['patron_status'] : null;
                $cents      = isset($item['attributes']['currently_entitled_amount_cents']) ? (int)$item['attributes']['currently_entitled_amount_cents'] : 0;
                $isFollower = !empty($item['attributes']['is_follower']);

                if (ALLOW_FREE_MEMBERS) {
                    // When Free Members are allowed, any member/follower of your campaign is granted access
                    // (except declined_patron unless they are still an active free follower)
                    if ($status !== 'declined_patron' || $isFollower) {
                        $isAuthorized = true;
                        break;
                    }
                } else {
                    // Only Paid Active Patrons meeting MIN_PLEDGE_CENTS
                    if ($status === 'active_patron' && $cents >= MIN_PLEDGE_CENTS) {
                        $isAuthorized = true;
                        break;
                    }
                }
            }
        }
    }

    if ($isAuthorized && $patreonUserId) {
        checkLeechProtection($patreonUserId);

        $_SESSION['patreon_verified'] = true;
        $_SESSION['patreon_verified_at'] = time();
        $_SESSION['patreon_user_id'] = $patreonUserId;
        $_SESSION['patreon_name'] = isset($identityData['data']['attributes']['full_name']) ? $identityData['data']['attributes']['full_name'] : 'Patron';

        $returnUrl = isset($_SESSION['patreon_return_url']) ? $_SESSION['patreon_return_url'] : (dirname($_SERVER['SCRIPT_NAME']) . '/');
        unset($_SESSION['patreon_return_url']);
        header('Location: ' . $returnUrl);
        exit;
    } else {
        showLoginScreen('Your Patreon account does not have an active subscription for this tier.');
    }
}

// ----------------------------------------------------------------------------
// 3. CHECK IF USER IS ALREADY VERIFIED IN SESSION
// ----------------------------------------------------------------------------
$isVerified = !empty($_SESSION['patreon_verified'])
    && !empty($_SESSION['patreon_verified_at'])
    && (time() - $_SESSION['patreon_verified_at'] < SESSION_TTL_SECONDS);

if (!$isVerified) {
    if (empty($_GET['file']) || preg_match('/\.(html?|php)$/i', $_GET['file'])) {
        $_SESSION['patreon_return_url'] = $_SERVER['REQUEST_URI'];
    }
    showLoginScreen();
}

if (!empty($_SESSION['patreon_user_id'])) {
    checkLeechProtection($_SESSION['patreon_user_id']);
}

// ----------------------------------------------------------------------------
// 4. SERVE THE REQUESTED FILE INSIDE THE PROTECTED FOLDER
// ----------------------------------------------------------------------------
$requestedFile = isset($_GET['file']) ? $_GET['file'] : '';
$requestedFile = ltrim($requestedFile, '/');

if ($requestedFile === '' || is_dir(__DIR__ . '/' . $requestedFile)) {
    $requestedFile = rtrim($requestedFile, '/');
    $prefix = $requestedFile !== '' ? $requestedFile . '/' : '';
    if (file_exists(__DIR__ . '/' . $prefix . 'index.html')) {
        $requestedFile = $prefix . 'index.html';
    } elseif (file_exists(__DIR__ . '/' . $prefix . 'index.php')) {
        $requestedFile = $prefix . 'index.php';
    }
}

$baseDir = realpath(__DIR__);
$targetPath = realpath(__DIR__ . '/' . $requestedFile);

$forbiddenFiles = array('patreon-gate.php', '.htaccess', '.patreon_ip_log.json');
if (
    !$targetPath ||
    strpos($targetPath, $baseDir) !== 0 ||
    !is_file($targetPath) ||
    in_array(basename($targetPath), $forbiddenFiles, true)
) {
    if (file_exists(__DIR__ . '/index.html')) {
        $targetPath = __DIR__ . '/index.html';
    } else {
        http_response_code(404);
        echo '404 - File Not Found';
        exit;
    }
}

$ext = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));
if ($ext === 'php') {
    include $targetPath;
    exit;
}

$mimeTypes = array(
    'html'  => 'text/html; charset=utf-8',
    'htm'   => 'text/html; charset=utf-8',
    'css'   => 'text/css; charset=utf-8',
    'js'    => 'application/javascript; charset=utf-8',
    'mjs'   => 'application/javascript; charset=utf-8',
    'json'  => 'application/json; charset=utf-8',
    'svg'   => 'image/svg+xml',
    'png'   => 'image/png',
    'jpg'   => 'image/jpeg',
    'jpeg'  => 'image/jpeg',
    'webp'  => 'image/webp',
    'gif'   => 'image/gif',
    'ico'   => 'image/x-icon',
    'woff'  => 'font/woff',
    'woff2' => 'font/woff2',
    'ttf'   => 'font/ttf',
    'mp4'   => 'video/mp4',
    'webm'  => 'video/webm',
);

$contentType = isset($mimeTypes[$ext]) ? $mimeTypes[$ext] : 'application/octet-stream';
header('Content-Type: ' . $contentType);
header('Content-Length: ' . filesize($targetPath));
readfile($targetPath);
exit;

// ----------------------------------------------------------------------------
// 5. BUILT-IN LEECH PROTECTION (MAX 4 IPs PER PATREON USER ID IN 2 HOURS)
// ----------------------------------------------------------------------------
function checkLeechProtection($patreonUserId) {
    if (MAX_IPS_PER_PATRON <= 0) return;

    $logFile = __DIR__ . '/.patreon_ip_log.json';
    $now = time();
    $clientIp = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';

    $data = array();
    if (file_exists($logFile)) {
        $raw = @file_get_contents($logFile);
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) $data = $decoded;
        }
    }

    foreach ($data as $uid => $ips) {
        if (!is_array($ips)) {
            unset($data[$uid]);
            continue;
        }
        foreach ($ips as $ip => $timestamp) {
            if ($now - $timestamp > LEECH_WINDOW_SECONDS) {
                unset($data[$uid][$ip]);
            }
        }
        if (empty($data[$uid])) {
            unset($data[$uid]);
        }
    }

    if (!isset($data[$patreonUserId])) {
        $data[$patreonUserId] = array();
    }

    $data[$patreonUserId][$clientIp] = $now;
    @file_put_contents($logFile, json_encode($data), LOCK_EX);

    if (count($data[$patreonUserId]) > MAX_IPS_PER_PATRON) {
        session_destroy();
        header('Location: ' . BLOCKED_REDIRECT_URL);
        exit;
    }
}

// ----------------------------------------------------------------------------
// 6. LOGIN SCREEN UI
// ----------------------------------------------------------------------------
function showLoginScreen($errorMsg = '') {
    $oauthUrl = 'https://www.patreon.com/oauth2/authorize?' . http_build_query(array(
        'response_type' => 'code',
        'client_id'     => PATREON_CLIENT_ID,
        'redirect_uri'  => PATREON_REDIRECT_URI,
        'scope'         => 'identity identity.memberships',
    ));
    // NOTE: Do NOT send http_response_code(401) because parent cPanel Basic Auth or ErrorDocument 401
    // in public_html/.htaccess intercepts 401 responses and triggers an Apache 500 error!
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>nAPPo Trails — Patreon Subscriber Access</title>
        <style>
            body {
                margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #0f172a; color: #f8fafc; padding: 20px;
            }
            .card {
                max-width: 420px; width: 100%; background: #1e293b; border-radius: 16px;
                padding: 32px 28px; text-align: center; box-shadow: 0 12px 32px rgba(0,0,0,0.45);
                border: 1px solid rgba(255,255,255,0.1);
            }
            h1 { margin: 0 0 12px; font-size: 1.5rem; }
            p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px; }
            .error {
                background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5;
                padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; margin-bottom: 20px;
            }
            .btn-patreon {
                display: block; width: 100%; box-sizing: border-box; padding: 13px 20px;
                background: #ff424d; color: #ffffff; font-weight: 700; font-size: 1rem;
                text-decoration: none; border-radius: 10px; transition: opacity 0.2s;
                margin-bottom: 12px;
            }
            .btn-patreon:hover { opacity: 0.9; }
            .btn-subscribe {
                display: inline-block; color: #cbd5e1; font-size: 0.88rem; text-decoration: underline;
                margin-top: 6px;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>nAPPo Trails — Patron Access</h1>
            <p>This area is reserved for our active Patreon supporters. Log in with your Patreon account to continue.</p>
            <?php if ($errorMsg): ?>
                <div class="error"><?php echo htmlspecialchars($errorMsg); ?></div>
            <?php endif; ?>
            <a class="btn-patreon" href="<?php echo htmlspecialchars($oauthUrl); ?>">Log in with Patreon</a>
            <a class="btn-subscribe" href="<?php echo htmlspecialchars(PATREON_CREATOR_URL); ?>" target="_blank" rel="noopener">
                Not a subscriber yet? Join on Patreon &rarr;
            </a>
        </div>
    </body>
    </html>
    <?php
    exit;
}
