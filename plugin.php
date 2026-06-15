<?php
/*
Plugin Name: YOURLS UI Kit Template
Plugin URI: https://github.com/uglyeoin/yourls-ui-kit-template
Description: A modern admin skin for YOURLS built on UIkit 3. Drop-in replacement for the dated default look. Re-skins the existing admin pages, adds a fresh dashboard, and tidies up forms, tables and error screens — all via hooks, no core files touched.
Version: 1.0.179
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
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="<?php echo $plugin_url; ?>/assets/uikit/uikit.min.css" />
    <script src="<?php echo $plugin_url; ?>/assets/uikit/uikit.min.js" defer></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0" />
    <link rel="stylesheet" href="<?php echo $plugin_url; ?>/assets/skin.css?v=<?php echo yourls_ui_kit_template_version(); ?>" />
    <script src="<?php echo $plugin_url; ?>/assets/skin.js?v=<?php echo yourls_ui_kit_template_version(); ?>" defer></script>
    <?php
}

function yourls_ui_kit_template_version() {
    return '1.0.179';
}

function yourls_ui_kit_settings_managers() {
    return array( 'kt', 'maprang', 'samai', 'tull' );
}

function yourls_ui_kit_settings_managers_label() {
    $labels = array();
    foreach ( yourls_ui_kit_settings_managers() as $manager ) {
        $labels[] = '<strong>' . htmlspecialchars( (string) $manager, ENT_QUOTES, 'UTF-8' ) . '</strong>';
    }
    return implode( ', ', $labels );
}

function yourls_ui_kit_can_manage_settings() {
    if ( !defined( 'YOURLS_USER' ) || !YOURLS_USER ) {
        return false;
    }

    $user = strtolower( (string) YOURLS_USER );
    foreach ( yourls_ui_kit_settings_managers() as $manager ) {
        if ( $user === strtolower( (string) $manager ) ) {
            return true;
        }
    }

    return false;
}

function yourls_ui_kit_theme_fields() {
    return array(
        'accent' => array(
            'label'       => 'Accent colour',
            'description' => 'Primary buttons, active navigation and highlights.',
            'default'     => '#1e87f0',
            'css_var'     => '--sb-accent',
        ),
        'background' => array(
            'label'       => 'Page background',
            'description' => 'The main admin page background.',
            'default'     => '#f3f6fb',
            'css_var'     => '--sb-bg',
        ),
        'surface' => array(
            'label'       => 'Surface',
            'description' => 'Cards, menus, panels and the top bar.',
            'default'     => '#ffffff',
            'css_var'     => '--sb-surface',
        ),
        'surface_muted' => array(
            'label'       => 'Muted surface',
            'description' => 'Subtle fills for tabs, table headers and secondary areas.',
            'default'     => '#f8fafc',
            'css_var'     => '--sb-surface-muted',
        ),
        'border' => array(
            'label'       => 'Border',
            'description' => 'Card, input, table and navigation borders.',
            'default'     => '#e2e8f0',
            'css_var'     => '--sb-border',
        ),
        'text' => array(
            'label'       => 'Text',
            'description' => 'Primary headings and body text.',
            'default'     => '#0f172a',
            'css_var'     => '--sb-text',
        ),
        'text_muted' => array(
            'label'       => 'Muted text',
            'description' => 'Descriptions, metadata and secondary navigation text.',
            'default'     => '#64748b',
            'css_var'     => '--sb-text-muted',
        ),
        'success' => array(
            'label'       => 'Success',
            'description' => 'Positive states and success indicators.',
            'default'     => '#10b981',
            'css_var'     => '--sb-success',
        ),
        'danger' => array(
            'label'       => 'Danger',
            'description' => 'Delete actions, warnings and destructive states.',
            'default'     => '#ef4444',
            'css_var'     => '--sb-danger',
        ),
    );
}

function yourls_ui_kit_sanitize_hex_colour( $value, $fallback ) {
    $value = trim( (string) $value );
    if ( preg_match( '/^#[0-9a-fA-F]{6}$/', $value ) ) {
        return strtolower( $value );
    }
    return strtolower( $fallback );
}

function yourls_ui_kit_get_theme() {
    $fields = yourls_ui_kit_theme_fields();
    $stored = yourls_get_option( 'sb_uikit_theme', array() );
    if ( !is_array( $stored ) ) {
        $stored = array();
    }

    $theme = array();
    foreach ( $fields as $key => $field ) {
        $fallback = $field['default'];
        if ( $key === 'accent' ) {
            $fallback = yourls_get_option( 'sb_uikit_accent', $field['default'] );
        }
        $theme[ $key ] = yourls_ui_kit_sanitize_hex_colour(
            isset( $stored[ $key ] ) ? $stored[ $key ] : $fallback,
            $field['default']
        );
    }

    return $theme;
}

function yourls_ui_kit_default_theme() {
    $theme = array();
    foreach ( yourls_ui_kit_theme_fields() as $key => $field ) {
        $theme[ $key ] = strtolower( $field['default'] );
    }
    return $theme;
}

function yourls_ui_kit_theme_presets() {
    return array(
        'light' => array(
            'label'       => 'Light',
            'description' => 'Current clean light interface.',
            'theme'       => yourls_ui_kit_default_theme(),
        ),
        'forest' => array(
            'label'       => 'Forest',
            'description' => 'Professional green theme with soft natural contrast.',
            'theme'       => array(
                'accent'        => '#047857',
                'background'    => '#f1f7f3',
                'surface'       => '#ffffff',
                'surface_muted' => '#e7f2ec',
                'border'        => '#c4d8cc',
                'text'          => '#10231b',
                'text_muted'    => '#5f7167',
                'success'       => '#059669',
                'danger'        => '#dc2626',
            ),
        ),
        'slate' => array(
            'label'       => 'Slate',
            'description' => 'Calm cool-gray admin theme for long work sessions.',
            'theme'       => array(
                'accent'        => '#2563eb',
                'background'    => '#f1f5f9',
                'surface'       => '#ffffff',
                'surface_muted' => '#e2e8f0',
                'border'        => '#cbd5e1',
                'text'          => '#0f172a',
                'text_muted'    => '#64748b',
                'success'       => '#059669',
                'danger'        => '#dc2626',
            ),
        ),
        'ocean' => array(
            'label'       => 'Ocean',
            'description' => 'Fresh blue and teal palette for web operations.',
            'theme'       => array(
                'accent'        => '#0891b2',
                'background'    => '#eef9fb',
                'surface'       => '#ffffff',
                'surface_muted' => '#e0f2fe',
                'border'        => '#bae6fd',
                'text'          => '#0f172a',
                'text_muted'    => '#486371',
                'success'       => '#0d9488',
                'danger'        => '#e11d48',
            ),
        ),
        'rosewood' => array(
            'label'       => 'Rosewood',
            'description' => 'Warm restrained rose palette for focused admin work.',
            'theme'       => array(
                'accent'        => '#be123c',
                'background'    => '#fbf7f8',
                'surface'       => '#ffffff',
                'surface_muted' => '#f8e8ec',
                'border'        => '#ead0d8',
                'text'          => '#1f1720',
                'text_muted'    => '#765c66',
                'success'       => '#15803d',
                'danger'        => '#dc2626',
            ),
        ),
        'graphite' => array(
            'label'       => 'Graphite',
            'description' => 'Neutral dark theme with restrained blue highlights.',
            'theme'       => array(
                'accent'        => '#60a5fa',
                'background'    => '#111827',
                'surface'       => '#1f2937',
                'surface_muted' => '#273449',
                'border'        => '#374151',
                'text'          => '#f9fafb',
                'text_muted'    => '#cbd5e1',
                'success'       => '#34d399',
                'danger'        => '#fb7185',
            ),
        ),
    );
}

function yourls_ui_kit_theme_preset_key( $theme ) {
    foreach ( yourls_ui_kit_theme_presets() as $preset_key => $preset ) {
        if ( $theme === $preset['theme'] ) {
            return $preset_key;
        }
    }
    return '';
}

function yourls_ui_kit_theme_inline_style( $theme, $prefix = '--sb-preview-' ) {
    $style = array();
    foreach ( $theme as $key => $value ) {
        $style[] = $prefix . str_replace( '_', '-', $key ) . ': ' . $value;
    }
    return implode( '; ', $style );
}

function yourls_ui_kit_is_plugins_manage_request() {
    $script = isset( $_SERVER['SCRIPT_NAME'] ) ? basename( $_SERVER['SCRIPT_NAME'] ) : '';
    if ( $script !== 'plugins.php' ) {
        return false;
    }
    if ( !empty( $_GET['page'] ) ) {
        return false;
    }

    $action = isset( $_GET['action'] ) ? $_GET['action'] : '';
    return in_array( $action, array( 'activate', 'deactivate' ), true );
}

yourls_add_action( 'auth_successful', 'yourls_ui_kit_restrict_plugin_management', 1 );

function yourls_ui_kit_restrict_plugin_management() {
    if ( !yourls_ui_kit_is_plugins_manage_request() ) {
        return;
    }
    if ( yourls_ui_kit_can_manage_settings() ) {
        return;
    }

    yourls_add_notice( 'เฉพาะผู้ใช้ ' . yourls_ui_kit_settings_managers_label() . ' เท่านั้นที่สามารถจัดการปลั๊กอินได้' );
    yourls_redirect( yourls_admin_url( 'plugins.php' ), 302 );
    exit();
}

function yourls_ui_kit_icon( $name, $class = '', $size = 0 ) {
    $classes = trim( 'material-symbols-outlined sb-icon ' . $class );
    $style = $size > 0 ? ' style="font-size:' . (int) $size . 'px"' : '';
    return '<span class="' . htmlspecialchars( $classes, ENT_QUOTES, 'UTF-8' ) . '" aria-hidden="true"' . $style . '>' . htmlspecialchars( $name, ENT_QUOTES, 'UTF-8' ) . '</span>';
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
yourls_add_filter( 'bodyclass', 'yourls_ui_kit_template_bodyclass' );

function yourls_ui_kit_template_bodyclass( $classes ) {
    $script = isset( $_SERVER['SCRIPT_NAME'] ) ? basename( $_SERVER['SCRIPT_NAME'] ) : '';
    $page   = isset( $_GET['page'] ) ? $_GET['page'] : '';

    if ( !yourls_is_admin() ) {
        if ( $script === 'index.php' && !defined( 'YOURLS_ADMIN' ) ) {
            $classes .= ' public-site';
        }
        return $classes;
    }

    if ( $script === 'plugins.php' && $page === 'uikit_skin_dashboard' ) {
        $classes .= ' sb-dashboard-admin-page';
    } elseif ( $script === 'plugins.php' && $page === 'uikit_skin_settings' ) {
        $classes .= ' sb-settings-admin-page';
    } elseif ( $script === 'plugins.php' && $page === '' ) {
        $classes .= ' sb-plugins-page';
    } elseif ( $script === 'tools.php' ) {
        $classes .= ' sb-tools-page';
    }

    return $classes;
}

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
          <?php echo yourls_ui_kit_icon( 'bolt', 'sb-logo-icon', 28 ); ?>
          <span class="sb-logo-text"><?php echo htmlspecialchars( parse_url( $site, PHP_URL_HOST ) ); ?></span>
        </a>
      </div>
      <div class="uk-navbar-center uk-visible@s sb-navbar-center">
        <ul class="uk-navbar-nav uk-visible@s sb-nav-main">
          <li class="<?php echo ($is_dashboard ? 'uk-active' : ''); ?>">
            <a href="<?php echo $dashboard_url; ?>"><?php echo yourls_ui_kit_icon( 'home' ); ?> Dashboard</a>
          </li>
          <li class="<?php echo ($current === 'index.php' ? 'uk-active' : ''); ?>">
            <a href="<?php echo yourls_admin_url('index.php'); ?>"><?php echo yourls_ui_kit_icon( 'link' ); ?> Links</a>
          </li>
          <li class="<?php echo ($current === 'tools.php' ? 'uk-active' : ''); ?>">
            <a href="<?php echo yourls_admin_url('tools.php'); ?>"><?php echo yourls_ui_kit_icon( 'handyman' ); ?> Tools</a>
          </li>
          <li class="<?php echo ($is_plugins ? 'uk-active' : ''); ?>">
            <a href="<?php echo yourls_admin_url('plugins.php'); ?>"><?php echo yourls_ui_kit_icon( 'extension' ); ?> Plugins</a>
          </li>
          <li class="<?php echo ($is_settings ? 'uk-active' : ''); ?>">
            <a href="<?php echo $settings_url; ?>"><?php echo yourls_ui_kit_icon( 'settings' ); ?> Settings</a>
          </li>
        </ul>
      </div>
      <div class="uk-navbar-right">
        <ul class="uk-navbar-nav sb-nav-actions">
          <li>
            <a href="<?php echo $site; ?>" target="_blank" rel="noopener" uk-tooltip="View public site">
              <?php echo yourls_ui_kit_icon( 'public' ); ?>
            </a>
          </li>
          <?php $logout_url = yourls_ui_kit_template_logout_url(); ?>
          <li class="sb-user-menu">
            <details class="sb-user-details">
              <summary class="sb-user-trigger">
                <?php echo yourls_ui_kit_icon( 'person' ); ?>
                <span class="sb-username"><?php echo defined('YOURLS_USER') ? htmlspecialchars( YOURLS_USER ) : ''; ?></span>
                <?php echo yourls_ui_kit_icon( 'expand_more', 'sb-user-caret', 18 ); ?>
              </summary>
              <div class="sb-user-dropdown">
                <div class="sb-user-dropdown-header">
                  <div class="sb-user-dropdown-label">Signed in as</div>
                  <div class="sb-user-dropdown-name"><?php echo defined('YOURLS_USER') ? htmlspecialchars( YOURLS_USER ) : 'guest'; ?></div>
                </div>
                <div class="sb-user-dropdown-divider"></div>
                <a href="<?php echo $logout_url; ?>" class="sb-user-dropdown-logout">
                  <?php echo yourls_ui_kit_icon( 'logout', '', 20 ); ?> Logout
                </a>
              </div>
            </details>
          </li>
        </ul>
        <button class="sb-mobile-menu-btn" type="button" aria-label="Open menu" uk-toggle="target: #sb-mobile-nav">
          <?php echo yourls_ui_kit_icon( 'menu' ); ?>
        </button>
      </div>
      </div>
    </nav>
    <div id="sb-mobile-nav" uk-offcanvas="overlay: true; flip: true">
      <div class="uk-offcanvas-bar sb-mobile-nav-panel">
        <button class="sb-mobile-nav-close" type="button" aria-label="Close menu" uk-toggle="target: #sb-mobile-nav">
          <?php echo yourls_ui_kit_icon( 'close' ); ?>
        </button>
        <div class="sb-mobile-nav-brand">
          <?php echo yourls_ui_kit_icon( 'bolt', 'sb-logo-icon', 24 ); ?>
          <span><?php echo htmlspecialchars( parse_url( $site, PHP_URL_HOST ) ); ?></span>
        </div>
        <ul class="sb-mobile-nav-links">
          <li class="<?php echo ($is_dashboard ? 'uk-active' : ''); ?>">
            <a href="<?php echo $dashboard_url; ?>"><?php echo yourls_ui_kit_icon( 'home' ); ?> Dashboard</a>
          </li>
          <li class="<?php echo ($current === 'index.php' ? 'uk-active' : ''); ?>">
            <a href="<?php echo yourls_admin_url('index.php'); ?>"><?php echo yourls_ui_kit_icon( 'link' ); ?> Links</a>
          </li>
          <li class="<?php echo ($current === 'tools.php' ? 'uk-active' : ''); ?>">
            <a href="<?php echo yourls_admin_url('tools.php'); ?>"><?php echo yourls_ui_kit_icon( 'handyman' ); ?> Tools</a>
          </li>
          <li class="<?php echo ($is_plugins ? 'uk-active' : ''); ?>">
            <a href="<?php echo yourls_admin_url('plugins.php'); ?>"><?php echo yourls_ui_kit_icon( 'extension' ); ?> Plugins</a>
          </li>
          <li class="<?php echo ($is_settings ? 'uk-active' : ''); ?>">
            <a href="<?php echo $settings_url; ?>"><?php echo yourls_ui_kit_icon( 'settings' ); ?> Settings</a>
          </li>
          <li>
            <a href="<?php echo $site; ?>" target="_blank" rel="noopener"><?php echo yourls_ui_kit_icon( 'public' ); ?> View site</a>
          </li>
        </ul>
      </div>
    </div>
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
    echo '<h3 class="uk-card-title">' . yourls_ui_kit_icon( 'link' ) . ' Your short links</h3>';
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
    <div class="sb-dashboard-header">
      <h2 class="sb-page-title">Dashboard</h2>
      <p class="uk-text-muted">A quick overview of your shortener.</p>
    </div>

    <div class="sb-dashboard-page">
      <!-- Stat tiles -->
      <div class="uk-grid-small uk-child-width-1-2 uk-child-width-1-4@m sb-stats" uk-grid>
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-stat-card sb-stat-blue">
            <div class="sb-stat-icon"><?php echo yourls_ui_kit_icon( 'link', '', 22 ); ?></div>
            <div class="sb-stat-value"><?php echo number_format( $total_links ); ?></div>
            <div class="sb-stat-label">Total links</div>
          </div>
        </div>
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-stat-card sb-stat-green">
            <div class="sb-stat-icon"><?php echo yourls_ui_kit_icon( 'bolt', '', 22 ); ?></div>
            <div class="sb-stat-value"><?php echo number_format( $total_clicks ); ?></div>
            <div class="sb-stat-label">Total clicks</div>
          </div>
        </div>
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-stat-card sb-stat-amber">
            <div class="sb-stat-icon"><?php echo yourls_ui_kit_icon( 'calendar_month', '', 22 ); ?></div>
            <div class="sb-stat-value"><?php echo number_format( $week_links ); ?></div>
            <div class="sb-stat-label">Links this week</div>
          </div>
        </div>
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-stat-card sb-stat-pink">
            <div class="sb-stat-icon"><?php echo yourls_ui_kit_icon( 'bar_chart', '', 22 ); ?></div>
            <div class="sb-stat-value"><?php echo $avg; ?></div>
            <div class="sb-stat-label">Avg. clicks / link</div>
          </div>
        </div>
      </div>

      <div class="uk-grid-medium uk-child-width-1-1 uk-child-width-1-2@m uk-margin-top sb-dashboard-grid" uk-grid>

        <!-- Top performers -->
        <div>
          <div class="uk-card uk-card-default uk-card-body sb-list-card uk-card-small">
            <h3 class="uk-card-title"><?php echo yourls_ui_kit_icon( 'star' ); ?> Top performers</h3>
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
            <h3 class="uk-card-title"><?php echo yourls_ui_kit_icon( 'schedule' ); ?> Recently created</h3>
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
          <?php echo yourls_ui_kit_icon( 'add' ); ?> Manage all links
        </a>
      </div>
                  </div>
    <?php
}

function yourls_ui_kit_template_settings_page() {
    $notice = '';
    $can_save = yourls_ui_kit_can_manage_settings();
    $theme_fields = yourls_ui_kit_theme_fields();

    // Save settings
    if ( isset($_POST['sb_uikit_save']) || isset($_POST['sb_uikit_reset']) ) {
        // This dies on failure with an "Unauthorized" message — perfect.
        yourls_verify_nonce( 'yourls-ui-kit-template_settings' );

        if ( !$can_save ) {
            $notice = '<div class="uk-alert-danger sb-settings-alert" uk-alert><p>เฉพาะผู้ใช้ ' . yourls_ui_kit_settings_managers_label() . ' เท่านั้นที่สามารถบันทึกการตั้งค่าได้</p></div>';
        } elseif ( isset($_POST['sb_uikit_reset']) ) {
            $theme = yourls_ui_kit_default_theme();
            yourls_update_option( 'sb_uikit_theme', $theme );
            yourls_update_option( 'sb_uikit_accent', $theme['accent'] );
            $notice = '<div class="uk-alert-success sb-settings-alert" uk-alert><p>รีเซ็ต theme กลับค่าเริ่มต้นแล้ว</p></div>';
        } else {
            $posted_theme = isset( $_POST['sb_uikit_theme'] ) && is_array( $_POST['sb_uikit_theme'] ) ? $_POST['sb_uikit_theme'] : array();
            $theme = array();
            $valid = true;

            foreach ( $theme_fields as $key => $field ) {
                $value = isset( $posted_theme[ $key ] ) ? trim( (string) $posted_theme[ $key ] ) : $field['default'];
                if ( !preg_match( '/^#[0-9a-fA-F]{6}$/', $value ) ) {
                    $valid = false;
                    break;
                }
                $theme[ $key ] = strtolower( $value );
            }

            if ( $valid ) {
                yourls_update_option( 'sb_uikit_theme', $theme );
                yourls_update_option( 'sb_uikit_accent', $theme['accent'] );
                $notice = '<div class="uk-alert-success sb-settings-alert" uk-alert><p>บันทึกการตั้งค่าแล้ว</p></div>';
            } else {
                $notice = '<div class="uk-alert-danger sb-settings-alert" uk-alert><p>สีไม่ถูกต้อง ใช้รหัส hex 6 หลัก เช่น #1e87f0 ทุกช่อง</p></div>';
            }
        }
    }

    $theme = yourls_ui_kit_get_theme();
    $nonce  = yourls_create_nonce( 'yourls-ui-kit-template_settings' );
    $theme_presets = yourls_ui_kit_theme_presets();
    $active_preset = yourls_ui_kit_theme_preset_key( $theme );
    $preset_json = json_encode( $theme_presets, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT );
    $accent_presets = array(
        '#1e87f0' => 'น้ำเงิน UIkit',
        '#127cfe' => 'ฟ้าสด',
        '#2563eb' => 'น้ำเงินเข้ม',
        '#0ea5e9' => 'ฟ้าอ่อน',
        '#0891b2' => 'ฟ้าทะเล',
        '#10b981' => 'เขียวมรกต',
        '#059669' => 'เขียว',
        '#7c3aed' => 'ม่วง',
        '#6366f1' => 'คราม',
        '#ea580c' => 'ส้ม',
        '#dc2626' => 'แดง',
        '#0f172a' => 'เทาเข้ม',
    );
    $accent_lower = strtolower( $theme['accent'] );
    $preview_style = yourls_ui_kit_theme_inline_style( $theme );
    ?>
    <div class="sb-settings-page">
      <div class="sb-settings-header">
        <div>
          <h2 class="sb-page-title">UIkit Skin Settings</h2>
          <p class="sb-settings-subtitle">Tune the full admin interface theme without editing plugin files.</p>
        </div>
      </div>

      <?php echo $notice; ?>

      <?php if ( !$can_save ) : ?>
      <div class="uk-alert-warning sb-settings-alert sb-settings-readonly-notice" uk-alert>
        <p>เฉพาะผู้ใช้ <?php echo yourls_ui_kit_settings_managers_label(); ?> เท่านั้นที่สามารถบันทึกการตั้งค่าได้ คุณสามารถดูค่าปัจจุบันได้อย่างเดียว</p>
      </div>
      <?php endif; ?>

      <div class="uk-card uk-card-default uk-card-body sb-settings-card<?php echo $can_save ? '' : ' sb-settings-card-readonly'; ?>">
        <form method="post" class="uk-form-stacked sb-settings-form">
          <input type="hidden" name="nonce" value="<?php echo $nonce; ?>" />
          <div class="sb-theme-section sb-theme-section-presets">
            <div class="sb-theme-section-header">
              <h3>Theme presets</h3>
            </div>
            <div class="sb-theme-presets" aria-label="Theme presets">
              <?php foreach ( $theme_presets as $preset_key => $preset ) :
                $preset_theme = $preset['theme'];
                $is_active = ( $preset_key === $active_preset );
              ?>
              <button
                type="button"
                class="sb-theme-preset<?php echo $is_active ? ' is-active' : ''; ?>"
                data-preset="<?php echo htmlspecialchars( $preset_key ); ?>"
                <?php echo $can_save ? '' : 'disabled'; ?>
                aria-pressed="<?php echo $is_active ? 'true' : 'false'; ?>"
              >
                <span class="sb-theme-preset-preview" style="<?php echo htmlspecialchars( yourls_ui_kit_theme_inline_style( $preset_theme, '--preset-' ) ); ?>">
                  <span></span><span></span><span></span>
                </span>
                <span class="sb-theme-preset-copy">
                  <strong><?php echo htmlspecialchars( $preset['label'] ); ?></strong>
                  <small><?php echo htmlspecialchars( $preset['description'] ); ?></small>
                </span>
              </button>
              <?php endforeach; ?>
            </div>
          </div>

          <div class="sb-theme-section sb-theme-section-custom">
            <div class="sb-theme-section-header">
              <h3>Custom colours</h3>
            </div>
            <div class="sb-theme-builder">
              <div class="sb-theme-fields">
                <?php foreach ( $theme_fields as $key => $field ) :
                  $input_id = 'sb_theme_' . $key;
                  $hex_id = 'sb_theme_' . $key . '_hex';
                  $value = $theme[ $key ];
                ?>
                <div class="sb-settings-row">
                  <div class="sb-settings-label">
                    <label class="uk-form-label" for="<?php echo htmlspecialchars( $input_id ); ?>"><?php echo htmlspecialchars( $field['label'] ); ?></label>
                    <p class="uk-text-meta"><?php echo htmlspecialchars( $field['description'] ); ?></p>
                  </div>
                  <div class="uk-form-controls sb-colour-controls-wrap">
                    <div class="sb-colour-controls">
                      <input
                        id="<?php echo htmlspecialchars( $input_id ); ?>"
                        class="sb-colour-picker"
                        name="sb_uikit_theme[<?php echo htmlspecialchars( $key ); ?>]"
                        type="color"
                        value="<?php echo htmlspecialchars( $value ); ?>"
                        data-theme-key="<?php echo htmlspecialchars( $key ); ?>"
                        data-default-color="<?php echo htmlspecialchars( strtolower( $field['default'] ) ); ?>"
                        data-preview-var="--sb-preview-<?php echo htmlspecialchars( str_replace( '_', '-', $key ) ); ?>"
                        data-hex-target="<?php echo htmlspecialchars( $hex_id ); ?>"
                        <?php echo $can_save ? '' : 'disabled'; ?>
                      />
                      <input
                        type="text"
                        class="uk-input sb-colour-hex"
                        value="<?php echo htmlspecialchars( $value ); ?>"
                        id="<?php echo htmlspecialchars( $hex_id ); ?>"
                        aria-label="<?php echo htmlspecialchars( $field['label'] . ' hex value' ); ?>"
                        data-theme-key="<?php echo htmlspecialchars( $key ); ?>"
                        data-default-color="<?php echo htmlspecialchars( strtolower( $field['default'] ) ); ?>"
                        data-preview-var="--sb-preview-<?php echo htmlspecialchars( str_replace( '_', '-', $key ) ); ?>"
                        data-picker-target="<?php echo htmlspecialchars( $input_id ); ?>"
                        <?php echo $can_save ? '' : 'readonly'; ?>
                      />
                    </div>
                    <?php if ( $key === 'accent' ) : ?>
                    <div class="sb-colour-chips" role="listbox" aria-label="เลือกสี accent สำเร็จรูป">
                      <span class="sb-colour-chips-label">สียอดนิยม</span>
                      <div class="sb-colour-chips-row">
                        <?php foreach ( $accent_presets as $preset_hex => $preset_label ) :
                          $preset_hex = strtolower( $preset_hex );
                          $is_active = ( $preset_hex === $accent_lower );
                        ?>
                        <button
                          type="button"
                          class="sb-colour-chip<?php echo $is_active ? ' is-active' : ''; ?>"
                          <?php echo $can_save ? '' : 'disabled '; ?>
                          data-color="<?php echo htmlspecialchars( $preset_hex ); ?>"
                          data-theme-key="accent"
                          style="--chip-color: <?php echo htmlspecialchars( $preset_hex ); ?>"
                          title="<?php echo htmlspecialchars( $preset_label . ' (' . strtoupper( $preset_hex ) . ')' ); ?>"
                          aria-label="<?php echo htmlspecialchars( $preset_label ); ?>"
                          role="option"
                          aria-selected="<?php echo $is_active ? 'true' : 'false'; ?>"
                        ></button>
                        <?php endforeach; ?>
                      </div>
                    </div>
                    <?php endif; ?>
                  </div>
                </div>
                <?php endforeach; ?>
              </div>

              <div class="sb-settings-live-preview" style="<?php echo htmlspecialchars( $preview_style ); ?>">
                <div class="sb-preview-browser">
                  <div class="sb-preview-nav">
                    <div class="sb-preview-brand">
                      <span class="sb-preview-logo"></span>
                      <span>apps2.coop.ku.ac.th</span>
                    </div>
                    <div class="sb-preview-tabs">
                      <span>Dashboard</span>
                      <span class="is-active">Links</span>
                      <span>Settings</span>
                    </div>
                    <span class="sb-preview-user">kt</span>
                  </div>
                  <div class="sb-preview-main">
                    <div class="sb-preview-heading">
                      <span></span>
                      <strong>Short links</strong>
                    </div>
                    <div class="sb-preview-input-row">
                      <span></span>
                      <button type="button">Shorten</button>
                    </div>
                    <div class="sb-preview-card">
                      <div class="sb-preview-table-head">
                        <span>Short URL</span>
                        <span>Destination</span>
                        <span>Clicks</span>
                      </div>
                      <div class="sb-preview-table-row">
                        <span class="sb-preview-link">kus.cc/demo</span>
                        <span class="sb-preview-muted">https://example.com/campaign</span>
                        <strong>128</strong>
                      </div>
                      <div class="sb-preview-table-row">
                        <span class="sb-preview-link">kus.cc/docs</span>
                        <span class="sb-preview-muted">https://example.com/docs</span>
                        <strong>42</strong>
                      </div>
                    </div>
                    <div class="sb-preview-status-row">
                      <span class="sb-preview-success">Saved</span>
                      <span class="sb-preview-danger">Delete</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <?php if ( $can_save ) : ?>
          <div class="sb-settings-actions">
            <button type="submit" name="sb_uikit_reset" value="1" class="uk-button uk-button-default sb-settings-reset">รีเซ็ตค่าเริ่มต้น</button>
            <button type="submit" name="sb_uikit_save" value="1" class="uk-button uk-button-primary sb-settings-submit">บันทึก</button>
          </div>
          <?php endif; ?>
        </form>
      </div>
    </div>
    <script>
      // Sync color pickers <-> hex fields <-> preview mockup.
      document.addEventListener('DOMContentLoaded', function(){
        var presets = <?php echo $preset_json ? $preset_json : '{}'; ?>;
        var preview = document.querySelector('.sb-settings-live-preview');
        var presetButtons = document.querySelectorAll('.sb-theme-preset[data-preset]');
        var chips = document.querySelectorAll('.sb-colour-chip');
        var pickers = document.querySelectorAll('.sb-colour-picker[data-theme-key]');
        var hexes = document.querySelectorAll('.sb-colour-hex[data-theme-key]');

        function updateChipActive(value) {
          if (!value) return;
          value = value.toLowerCase();
          chips.forEach(function (chip) {
            var match = (chip.getAttribute('data-color') || '').toLowerCase() === value;
            chip.classList.toggle('is-active', match);
            chip.setAttribute('aria-selected', match ? 'true' : 'false');
          });
        }

        function currentTheme() {
          var theme = {};
          hexes.forEach(function (hex) {
            var key = hex.getAttribute('data-theme-key');
            if (key) theme[key] = (hex.value || '').toLowerCase();
          });
          return theme;
        }

        function themesMatch(theme, presetTheme) {
          if (!theme || !presetTheme) return false;
          return Object.keys(presetTheme).every(function (key) {
            return (theme[key] || '').toLowerCase() === (presetTheme[key] || '').toLowerCase();
          });
        }

        function updatePresetActive() {
          var theme = currentTheme();
          presetButtons.forEach(function (button) {
            var preset = presets[button.getAttribute('data-preset')];
            var match = preset && themesMatch(theme, preset.theme);
            button.classList.toggle('is-active', !!match);
            button.setAttribute('aria-pressed', match ? 'true' : 'false');
          });
        }

        function setThemeColor(key, value) {
          if (!key || !/^#[0-9a-fA-F]{6}$/i.test(value)) return;
          value = value.toLowerCase();
          var picker = document.querySelector('.sb-colour-picker[data-theme-key="' + key + '"]');
          var hex = document.querySelector('.sb-colour-hex[data-theme-key="' + key + '"]');
          var cssVar = picker ? picker.getAttribute('data-preview-var') : (hex ? hex.getAttribute('data-preview-var') : '');

          if (picker) picker.value = value;
          if (hex) hex.value = value;
          if (preview && cssVar) preview.style.setProperty(cssVar, value);
          if (key === 'accent') {
            updateChipActive(value);
          }
          updatePresetActive();
        }

        function setTheme(theme) {
          if (!theme) return;
          Object.keys(theme).forEach(function (key) {
            setThemeColor(key, theme[key]);
          });
          updatePresetActive();
        }

        presetButtons.forEach(function (button) {
          button.addEventListener('click', function () {
            var preset = presets[button.getAttribute('data-preset')];
            if (preset) setTheme(preset.theme);
          });
        });

        pickers.forEach(function (pick) {
          pick.addEventListener('input', function () {
            setThemeColor(pick.getAttribute('data-theme-key'), pick.value);
          });
        });

        hexes.forEach(function (hex) {
          hex.addEventListener('input', function () {
            if (/^#[0-9a-fA-F]{6}$/i.test(hex.value)) {
              setThemeColor(hex.getAttribute('data-theme-key'), hex.value);
            }
          });
        });

        chips.forEach(function (chip) {
          chip.addEventListener('click', function () {
            setThemeColor(chip.getAttribute('data-theme-key'), chip.getAttribute('data-color'));
          });
        });

        var accentHex = document.querySelector('.sb-colour-hex[data-theme-key="accent"]');
        updateChipActive(accentHex ? accentHex.value : '');
        updatePresetActive();
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
    $theme = yourls_ui_kit_get_theme();
    $fields = yourls_ui_kit_theme_fields();
    $vars = array();
    foreach ( $fields as $key => $field ) {
        $vars[] = $field['css_var'] . ':' . $theme[ $key ];
    }
    $vars[] = '--sb-card-bg:' . $theme['surface'];
    $vars[] = '--sb-input-bg:' . $theme['surface'];
    $vars[] = '--sb-input-border:' . $theme['border'];
    $vars[] = '--sb-input-text:' . $theme['text'];
    $can_manage = yourls_ui_kit_can_manage_settings() ? 'true' : 'false';
    echo "<style>:root{" . implode( ';', $vars ) . ";}</style>\n";
    echo "<script>window._sbCanManageSettings=" . $can_manage . ";</script>\n";
    if ( function_exists( 'yourls_get_html_context' ) && yourls_get_html_context() === 'login' && defined( 'YOURLS_VERSION' ) ) {
        echo '<script>window._yourlsVersion="' . htmlspecialchars( YOURLS_VERSION, ENT_QUOTES, 'UTF-8' ) . '";</script>' . "\n";
    }
}
