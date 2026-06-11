<?php
/*
Plugin Name: YOURLS UI Kit Template
Plugin URI: https://github.com/uglyeoin/yourls-ui-kit-template
Description: A modern admin skin for YOURLS built on UIkit 3. Drop-in replacement for the dated default look. Re-skins the existing admin pages, adds a fresh dashboard, and tidies up forms, tables and error screens — all via hooks, no core files touched.
Version: 1.0.139
Author: Square Balloon Ltd
Author URI: https://squareballoon.co.uk
*/

// No direct access
if ( !defined( 'YOURLS_ABSPATH' ) ) die();

/* ------------------------------------------------------------------
 *  1.  Inject UIkit CSS + JS + our skin into every admin page <head>
 * ------------------------------------------------------------------ */

yourls_add_action( 'html_head', 'yourls_ui_kit_template_head', 5 );

function yourls_ui_kit_template_head() {
    // UIkit version pinned. Update here when you want to bump it.
    $uikit_ver = '3.25.16';
    $plugin_url = YOURLS_SITE . '/user/plugins/uikit-skin';
    ?>
    <link rel="stylesheet" href="<?php echo $plugin_url; ?>/assets/uikit/uikit.min.css" />
    <script src="<?php echo $plugin_url; ?>/assets/uikit/uikit.min.js" defer></script>
    <script src="<?php echo $plugin_url; ?>/assets/uikit/uikit-icons.min.js" defer></script>
    <link rel="stylesheet" href="<?php echo $plugin_url; ?>/assets/skin.css?v=<?php echo yourls_ui_kit_template_version(); ?>" />
    <script src="<?php echo $plugin_url; ?>/assets/skin.js?v=<?php echo yourls_ui_kit_template_version(); ?>" defer></script>
    <?php
}

function yourls_ui_kit_template_version() {
    return '1.0.139';
}

yourls_add_filter( 'html_title', 'yourls_ui_kit_template_html_title', 10, 2 );

function yourls_ui_kit_template_html_title( $title, $context ) {
    $plain_title = html_entity_decode( strip_tags( $title ), ENT_QUOTES, 'UTF-8' );
    $plain_title = preg_replace( '/\s+/', ' ', trim( $plain_title ) );

    if ( stripos( $plain_title, 'LINK-KUSCC:' ) === 0 ) {
        return htmlspecialchars( $plain_title, ENT_QUOTES, 'UTF-8' );
    }

    return 'LINK-KUSCC: ' . htmlspecialchars( $plain_title, ENT_QUOTES, 'UTF-8' );
}

/* ------------------------------------------------------------------
 *  2.  Replace the logo block with a UIkit navbar
 *      The 'html_logo' action fires right after <body>, before the
 *      page <main> content. We swap the default H1+P logo for a
 *      proper top-bar with the site name + nav links.
 * ------------------------------------------------------------------ */

// Kill the default logo output. We do it by hooking BEFORE yourls_html_logo()
// fires its action. Since the default function just echoes a div, we can't
// truly "remove" it — but we CAN inject our navbar AFTER it and hide the
// original via CSS. That's what skin.css does (#wrap > h1 { display:none }).

yourls_add_action( 'html_logo', 'yourls_ui_kit_template_navbar' );

function yourls_ui_kit_template_logout_url() {
    return yourls_nonce_url(
        'admin_logout',
        yourls_admin_url( 'index.php?action=logout' ),
        'nonce',
        'logout'
    );
}

function yourls_ui_kit_template_navbar() {
    $site = YOURLS_SITE;
    $admin = yourls_admin_url();
    $current = isset($_SERVER['SCRIPT_NAME']) ? basename($_SERVER['SCRIPT_NAME']) : '';
    $current_page = isset($_GET['page']) ? $_GET['page'] : '';

    // Plugin pages registered via yourls_register_plugin_page() show up
    // at plugins.php?page=xxx — add our dashboard there as a top-level item.
    $dashboard_url = yourls_admin_url( 'plugins.php?page=uikit_skin_dashboard' );

    $is_dashboard = ($current === 'plugins.php' && $current_page === 'uikit_skin_dashboard');
    $is_plugins   = ($current === 'plugins.php' && $current_page === '');
    $is_settings  = ($current === 'plugins.php' && $current_page === 'uikit_skin_settings');
    $settings_url = yourls_admin_url( 'plugins.php?page=uikit_skin_settings' );
    ?>
    <nav class="sb-navbar">
      <div class="uk-navbar-container sb-navbar-inner" uk-navbar="mode: click">
      <div class="uk-navbar-left sb-navbar-brand">
        <a class="uk-navbar-item uk-logo sb-logo" href="<?php echo $admin; ?>">
          <span uk-icon="icon: bolt; ratio: 1.4" class="sb-logo-icon"></span>
          <span class="sb-logo-text"><?php echo htmlspecialchars( parse_url( $site, PHP_URL_HOST ) ); ?></span>
        </a>
      </div>
      <div class="uk-navbar-center uk-visible@s sb-navbar-center">
        <ul class="uk-navbar-nav uk-visible@s sb-nav-main">
          <li class="<?php echo ($is_dashboard ? 'uk-active' : ''); ?>">
            <a href="<?php echo $dashboard_url; ?>"><span uk-icon="icon: home"></span> Dashboard</a>
          </li>
          <li class="<?php echo ($current === 'index.php' ? 'uk-active' : ''); ?>">
            <a href="<?php echo yourls_admin_url('index.php'); ?>"><span uk-icon="icon: link"></span> Links</a>
          </li>
          <li class="<?php echo ($current === 'tools.php' ? 'uk-active' : ''); ?>">
            <a href="<?php echo yourls_admin_url('tools.php'); ?>"><span uk-icon="icon: cog"></span> Tools</a>
          </li>
          <li class="<?php echo ($is_plugins ? 'uk-active' : ''); ?>">
            <a href="<?php echo yourls_admin_url('plugins.php'); ?>"><span uk-icon="icon: database"></span> Plugins</a>
          </li>
          <li class="<?php echo ($is_settings ? 'uk-active' : ''); ?>">
            <a href="<?php echo $settings_url; ?>"><span uk-icon="icon: settings"></span> Settings</a>
          </li>
        </ul>
      </div>
      <div class="uk-navbar-right">
        <ul class="uk-navbar-nav sb-nav-actions">
          <li>
            <a href="<?php echo $site; ?>" target="_blank" rel="noopener" uk-tooltip="View public site">
              <span uk-icon="icon: world"></span>
            </a>
          </li>
          <?php $logout_url = yourls_ui_kit_template_logout_url(); ?>
          <li class="sb-user-menu">
            <details class="sb-user-details">
              <summary class="sb-user-trigger">
                <span uk-icon="icon: user"></span>
                <span class="sb-username"><?php echo defined('YOURLS_USER') ? htmlspecialchars( YOURLS_USER ) : ''; ?></span>
                <span class="sb-user-caret">▾</span>
              </summary>
              <div class="sb-user-dropdown">
                <div class="sb-user-dropdown-header">
                  <div class="sb-user-dropdown-label">Signed in as</div>
                  <div class="sb-user-dropdown-name"><?php echo defined('YOURLS_USER') ? htmlspecialchars( YOURLS_USER ) : 'guest'; ?></div>
                </div>
                <div class="sb-user-dropdown-divider"></div>
                <a href="<?php echo $logout_url; ?>" class="sb-user-dropdown-logout">
                  <span uk-icon="icon: sign-out; ratio: 0.9"></span> Logout
                </a>
              </div>
            </details>
          </li>
        </ul>
      </div>
      </div>
    </nav>
    <?php
}

/* ------------------------------------------------------------------
 *  4.  Beautify the "main table" wrapper.
 *      Many YOURLS admin pages call yourls_table_head() and
 *      yourls_table_tfoot() — we hook around those to wrap the
 *      table inside a UIkit card.
 * ------------------------------------------------------------------ */
yourls_add_action( 'admin_page_before_table', 'yourls_ui_kit_template_table_open' );
yourls_add_action( 'admin_page_after_table', 'yourls_ui_kit_template_table_close' );

function yourls_ui_kit_template_table_open() {
    echo '<div class="uk-card uk-card-default uk-card-body sb-table-card uk-margin-top">';
    echo '<h3 class="uk-card-title"><span uk-icon="icon: link"></span> Your short links</h3>';
}

function yourls_ui_kit_template_table_close() {
    echo '</div>';
}

/* ------------------------------------------------------------------
 *  5.  Register a new "Dashboard" plugin page with stat tiles
 * ------------------------------------------------------------------ */

// Set MySQL session timezone to Thailand (UTC+7) so NOW() stores correct local time
yourls_add_action( 'plugins_loaded', 'yourls_ui_kit_set_timezone', 1 );
function yourls_ui_kit_set_timezone() {
    try {
        yourls_get_db()->perform( "SET time_zone = '+07:00'" );
    } catch ( \Throwable $e ) {}
}

yourls_add_filter( 'shunt_add_new_link', 'yourls_ui_kit_block_reserved_keyword', 10, 4 );
yourls_add_filter( 'shunt_edit_link', 'yourls_ui_kit_block_reserved_edit_keyword', 10, 6 );
yourls_add_filter( 'keyword_is_reserved', 'yourls_ui_kit_mark_reserved_keyword', 10, 2 );

function yourls_ui_kit_is_reserved_keyword( $keyword ) {
    $keyword = function_exists( 'yourls_sanitize_keyword' ) ? yourls_sanitize_keyword( $keyword ) : trim( (string) $keyword );
    return strpos( strtolower( $keyword ), 'kuscc' ) !== false;
}

function yourls_ui_kit_reserved_keyword_message() {
    return 'Custom short URLs cannot contain "kuscc" because it duplicates the hosting name.';
}

function yourls_ui_kit_block_reserved_keyword( $pre, $url = '', $keyword = '', $title = '' ) {
    if ( !yourls_ui_kit_is_reserved_keyword( $keyword ) ) {
        return $pre;
    }

    return array(
        'status'     => 'fail',
        'code'       => 'error:keyword',
        'message'    => yourls_ui_kit_reserved_keyword_message(),
        'errorCode'  => 400,
        'statusCode' => 400,
        'url'        => $url,
        'keyword'    => $keyword,
        'title'      => $title,
    );
}

function yourls_ui_kit_block_reserved_edit_keyword( $pre, $keyword = '', $url = '', $oldkeyword = '', $newkeyword = '', $title = '' ) {
    if ( !yourls_ui_kit_is_reserved_keyword( $newkeyword ) ) {
        return $pre;
    }

    return array(
        'status'     => 'fail',
        'code'       => 'error:keyword',
        'message'    => yourls_ui_kit_reserved_keyword_message(),
        'errorCode'  => 400,
        'statusCode' => 400,
    );
}

function yourls_ui_kit_mark_reserved_keyword( $reserved, $keyword = '' ) {
    if ( yourls_ui_kit_is_reserved_keyword( $keyword ) ) {
        return true;
    }

    return $reserved;
}

yourls_add_action( 'plugins_loaded', 'yourls_ui_kit_template_register_pages' );

function yourls_ui_kit_template_register_pages() {
    yourls_register_plugin_page( 'uikit_skin_dashboard', 'Dashboard', 'yourls_ui_kit_template_dashboard_page' );
    yourls_register_plugin_page( 'uikit_skin_settings',  'UIkit Skin Settings', 'yourls_ui_kit_template_settings_page' );
}

function yourls_ui_kit_template_dashboard_page() {
    global $ydb;

    // Fetch basic stats
    $table = YOURLS_DB_TABLE_URL;
    $total_links = (int) yourls_get_db()->fetchValue( "SELECT COUNT(keyword) FROM `$table`" );
    $total_clicks = (int) yourls_get_db()->fetchValue( "SELECT SUM(clicks) FROM `$table`" );

    // Last 7 days links
    $week_links = (int) yourls_get_db()->fetchValue(
        "SELECT COUNT(keyword) FROM `$table` WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );

    // Top 5 by clicks
    $top = yourls_get_db()->fetchObjects(
        "SELECT keyword, url, title, clicks FROM `$table` ORDER BY clicks DESC LIMIT 5"
    );

    // Most recent 5
    $recent = yourls_get_db()->fetchObjects(
        "SELECT keyword, url, title, clicks, timestamp FROM `$table` ORDER BY timestamp DESC LIMIT 5"
    );

    $avg = $total_links > 0 ? round( $total_clicks / $total_links, 1 ) : 0;
    ?>
    <div class="uk-container sb-dashboard-header">
      <h2 class="sb-page-title">Dashboard</h2>
      <p class="uk-text-muted">A quick overview of your shortener.</p>
    </div>

    <div class="uk-container sb-dashboard-page">
      <!-- Stat tiles -->
      <div class="uk-grid-small uk-child-width-1-2 uk-child-width-1-4@m sb-stats" uk-grid>
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-stat-card sb-stat-blue">
            <div class="sb-stat-icon"><span uk-icon="icon: link; ratio: 1.6"></span></div>
            <div class="sb-stat-value"><?php echo number_format( $total_links ); ?></div>
            <div class="sb-stat-label">Total links</div>
          </div>
        </div>
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-stat-card sb-stat-green">
            <div class="sb-stat-icon"><span uk-icon="icon: bolt; ratio: 1.6"></span></div>
            <div class="sb-stat-value"><?php echo number_format( $total_clicks ); ?></div>
            <div class="sb-stat-label">Total clicks</div>
          </div>
        </div>
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-stat-card sb-stat-amber">
            <div class="sb-stat-icon"><span uk-icon="icon: calendar; ratio: 1.6"></span></div>
            <div class="sb-stat-value"><?php echo number_format( $week_links ); ?></div>
            <div class="sb-stat-label">Links this week</div>
          </div>
        </div>
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-stat-card sb-stat-pink">
            <div class="sb-stat-icon"><span uk-icon="icon: bar-chart; ratio: 1.6"></span></div>
            <div class="sb-stat-value"><?php echo $avg; ?></div>
            <div class="sb-stat-label">Avg. clicks / link</div>
          </div>
        </div>
      </div>

      <div class="uk-grid-medium uk-child-width-1-1 uk-child-width-1-2@m uk-margin-top sb-dashboard-grid" uk-grid>

        <!-- Top performers -->
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-list-card uk-card-small">
            <h3 class="uk-card-title"><span uk-icon="icon: star"></span> Top performers</h3>
            <?php if ( !$top ) : ?>
              <p class="uk-text-muted">No links yet.</p>
            <?php else: ?>
              <div class="uk-overflow-container sb-table-scroll">
                <table class="uk-table uk-table-divider uk-table-small uk-table-middle sb-dashboard-table">
                  <thead><tr><th class="sb-col-short">Short URL</th><th class="sb-col-destination">Destination</th><th class="uk-text-right sb-col-meta">Clicks</th></tr></thead>
                  <tbody>
                  <?php foreach ( $top as $row ) : ?>
                    <tr>
                      <td class="sb-col-short"><a href="<?php echo yourls_link( $row->keyword ); ?>" target="_blank"><?php echo htmlspecialchars( $row->keyword ); ?></a></td>
                      <td class="sb-col-destination">
                        <?php if ( !empty($row->title) ) : ?>
                          <strong class="sb-list-title"><?php echo htmlspecialchars( $row->title ); ?></strong><br>
                        <?php endif; ?>
                        <small class="uk-text-muted"><?php echo htmlspecialchars( $row->url ); ?></small>
                      </td>
                      <td class="uk-text-right sb-col-meta"><span class="uk-label sb-clicks-badge"><?php echo number_format( $row->clicks ); ?></span></td>
                    </tr>
                  <?php endforeach; ?>
                  </tbody>
                </table>
              </div>
            <?php endif; ?>
          </div>
        </div>

        <!-- Recent links -->
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-list-card uk-card-small">
            <h3 class="uk-card-title"><span uk-icon="icon: clock"></span> Recently created</h3>
            <?php if ( !$recent ) : ?>
              <p class="uk-text-muted">No links yet.</p>
            <?php else: ?>
            <div class="uk-overflow-container sb-table-scroll">
              <table class="uk-table uk-table-divider uk-table-small uk-table-middle sb-dashboard-table">
                <thead><tr><th class="sb-col-short">Short URL</th><th class="sb-col-destination">Destination</th><th class="uk-text-right sb-col-meta">When</th></tr></thead>
                <tbody>
                <?php foreach ( $recent as $row ) : ?>
                  <tr>
                    <td class="sb-col-short"><a href="<?php echo yourls_link( $row->keyword ); ?>" target="_blank"><?php echo htmlspecialchars( $row->keyword ); ?></a></td>
                    <td class="sb-col-destination">
                      <?php if ( !empty($row->title) ) : ?>
                        <strong class="sb-list-title"><?php echo htmlspecialchars( $row->title ); ?></strong><br>
                      <?php endif; ?>
                      <small class="uk-text-muted"><?php echo htmlspecialchars( $row->url ); ?></small>
                    </td>
                    <td class="uk-text-right sb-col-meta"><small class="uk-text-muted"><?php echo yourls_date_i18n( 'M j, H:i', strtotime( $row->timestamp ) ); ?></small></td>
                  </tr>
                <?php endforeach; ?>
                </tbody>
              </table>
            </div>
            <?php endif; ?>
          </div>
        </div>
      </div>

      <div class="sb-dashboard-actions">
        <a class="uk-button uk-button-primary sb-cta" href="<?php echo yourls_admin_url('index.php'); ?>">
          <span uk-icon="icon: plus"></span> Manage all links
        </a>
      </div>
                  </div>
    <?php
}

function yourls_ui_kit_template_settings_page() {
    $notice = '';

    // Save settings
    if ( isset($_POST['sb_uikit_save']) ) {
        // This dies on failure with an "Unauthorized" message — perfect.
        yourls_verify_nonce( 'yourls-ui-kit-template_settings' );

        $accent = isset($_POST['sb_accent_color']) ? trim($_POST['sb_accent_color']) : '#1e87f0';
        // Sanitise: must be a hex colour
        if ( preg_match('/^#[0-9a-fA-F]{6}$/', $accent) ) {
            yourls_update_option( 'sb_uikit_accent', $accent );
            $notice = '<div class="uk-alert-success sb-settings-alert" uk-alert><p>Settings saved.</p></div>';
        } else {
            $notice = '<div class="uk-alert-danger sb-settings-alert" uk-alert><p>Invalid colour. Use a 6-digit hex code like #1e87f0.</p></div>';
        }
    }

    $accent = yourls_get_option( 'sb_uikit_accent', '#1e87f0' );
    $nonce  = yourls_create_nonce( 'yourls-ui-kit-template_settings' );
    ?>
    <div class="uk-container sb-settings-page">
      <div class="sb-settings-header">
        <div>
          <h2 class="sb-page-title">UIkit Skin Settings</h2>
          <p class="sb-settings-subtitle">Tune the admin interface colours without editing plugin files.</p>
        </div>
      </div>

      <?php echo $notice; ?>

      <div class="uk-card uk-card-default uk-card-body sb-settings-card">
        <form method="post" class="uk-form-stacked sb-settings-form">
          <input type="hidden" name="nonce" value="<?php echo $nonce; ?>" />
          <div class="sb-settings-row">
            <div class="sb-settings-label">
              <label class="uk-form-label" for="sb_accent_color">Accent colour</label>
              <p class="uk-text-meta">Used for primary buttons, active navigation and stat highlights.</p>
            </div>
            <div class="uk-form-controls sb-colour-controls">
              <input id="sb_accent_color" class="sb-colour-picker" name="sb_accent_color" type="color" value="<?php echo htmlspecialchars($accent); ?>" />
              <input type="text" class="uk-input sb-colour-hex" value="<?php echo htmlspecialchars($accent); ?>" id="sb_accent_hex" aria-label="Accent colour hex value" />
            </div>
          </div>

          <div class="sb-settings-preview" style="--sb-preview-accent: <?php echo htmlspecialchars($accent); ?>">
            <span class="sb-preview-dot"></span>
            <span>Preview accent</span>
            <strong><?php echo htmlspecialchars($accent); ?></strong>
          </div>

          <div class="sb-settings-actions">
            <button type="submit" name="sb_uikit_save" value="1" class="uk-button uk-button-primary sb-settings-submit">Save changes</button>
          </div>
        </form>
      </div>
    </div>
    <script>
      // Sync color picker <-> hex field
      document.addEventListener('DOMContentLoaded', function(){
        var pick = document.getElementById('sb_accent_color');
        var hex  = document.getElementById('sb_accent_hex');
        var preview = document.querySelector('.sb-settings-preview');
        var previewValue = preview ? preview.querySelector('strong') : null;
        function updatePreview(value) {
          if (!preview || !/^#[0-9a-fA-F]{6}$/.test(value)) return;
          preview.style.setProperty('--sb-preview-accent', value);
          if (previewValue) previewValue.textContent = value;
        }
        if (pick && hex) {
          pick.addEventListener('input', function(){
            hex.value = pick.value;
            updatePreview(pick.value);
          });
          hex.addEventListener('input', function(){
            if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
              pick.value = hex.value;
              updatePreview(hex.value);
            }
          });
        }
      });
    </script>
    <?php
}

/* ------------------------------------------------------------------
 *  6a. Record the logged-in user when a new short URL is created
 * ------------------------------------------------------------------ */

yourls_add_action( 'add_new_link', 'yourls_ui_kit_record_user', 10, 4 );

function yourls_ui_kit_record_user( $return, $url, $keyword, $title ) {
    // Get user — constant first, cookie as fallback
    $user = ( defined( 'YOURLS_USER' ) && YOURLS_USER ) ? YOURLS_USER : null;
    if ( ! $user && isset( $_COOKIE['yourls_username'] ) ) {
        $user = preg_replace( '/[^a-zA-Z0-9_\-@.]/', '', $_COOKIE['yourls_username'] );
    }

    if ( ! $user ) return;

    $table = YOURLS_DB_TABLE_URL;
    $sql   = "UPDATE `{$table}` SET `user` = ? WHERE `keyword` = ?";

    // Direct PDO — most reliable
    try {
        $pdo = new PDO(
            'mysql:host=' . YOURLS_DB_HOST . ';dbname=' . YOURLS_DB_NAME . ';charset=utf8mb4',
            YOURLS_DB_USER,
            YOURLS_DB_PASS,
            array( PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION )
        );
        $stmt = $pdo->prepare( $sql );
        $stmt->execute( array( $user, $keyword ) );
        if ( $stmt->rowCount() > 0 ) return;
    } catch ( \Throwable $e ) {
        error_log( 'UIKit record_user PDO: ' . $e->getMessage() );
    }

    // Fallback: YOURLS DB wrapper
    try {
        $db = yourls_get_db();
        if ( method_exists( $db, 'getPdo' ) ) {
            $db->getPdo()->prepare( $sql )->execute( array( $user, $keyword ) );
        } elseif ( method_exists( $db, 'perform' ) ) {
            $db->perform( "UPDATE `{$table}` SET `user` = :u WHERE `keyword` = :k", array( 'u' => $user, 'k' => $keyword ) );
        }
    } catch ( \Throwable $e ) {
        error_log( 'UIKit record_user wrapper: ' . $e->getMessage() );
    }
}

/* ------------------------------------------------------------------
 *  6.  Inject the accent colour as a CSS variable so admins can theme
 *      the skin without editing CSS.
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------
 *  7.  Show "User" column in the admin links table (JS-injected)
 *      Avoids colspan mismatches from PHP hook approach.
 * ------------------------------------------------------------------ */

yourls_add_action( 'admin_page_before_table', 'yourls_ui_kit_inject_user_data' );

function yourls_ui_kit_inject_user_data() {
    $map = array();
    try {
        $table = YOURLS_DB_TABLE_URL;
        $rows  = yourls_get_db()->fetchAll( "SELECT keyword, user FROM `{$table}`" );
        foreach ( $rows as $row ) {
            if ( !empty( $row['user'] ) ) {
                $map[ $row['keyword'] ] = $row['user'];
            }
        }
    } catch ( \Throwable $e ) {}
    echo '<script>window._yourlsUsers = ' . json_encode( $map, JSON_HEX_TAG ) . ';</script>' . "\n";
}

yourls_add_action( 'html_head', 'yourls_ui_kit_template_inline_vars', 6 );

function yourls_ui_kit_template_inline_vars() {
    $accent = yourls_get_option( 'sb_uikit_accent', '#1e87f0' );
    if ( !preg_match('/^#[0-9a-fA-F]{6}$/', $accent) ) $accent = '#1e87f0';
    echo "<style>:root{--sb-accent:" . $accent . ";}</style>\n";
}
