/* ============================================================
   YOURLS UIkit Skin — runtime tweaks
   ============================================================ */

(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    // ── QR modal (created once, reused) ──────────────────────────────
    var _qrModal = null;

    function sbGetQrModal() {
        if (_qrModal) return _qrModal;
        var el = document.createElement('div');
        el.id = 'sb-qr-modal';
        el.style.cssText = 'display:none;position:fixed;inset:0;z-index:9990;align-items:center;justify-content:center;background:rgba(0,0,0,.5);padding:20px;box-sizing:border-box;';
        el.innerHTML = [
            '<div class="sb-qr-dialog" style="background:#fff;border-radius:14px;padding:32px 28px 24px;max-width:340px;width:100%;text-align:center;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.18);">',
            '  <button id="sb-qr-close" style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:20px;line-height:1;cursor:pointer;color:#6b7280;padding:4px 8px;" title="Close">&times;</button>',
            '  <p class="sb-qr-kw" style="font-size:13px;font-weight:600;color:#6b7280;margin:0 0 14px;word-break:break-all;"></p>',
            '  <img id="sb-qr-img" src="" alt="QR Code" style="width:280px;height:280px;border:1px solid #e5e9f0;border-radius:10px;display:block;margin:0 auto 12px;" />',
            '  <p class="sb-qr-url" style="font-size:12px;color:#1e87f0;word-break:break-all;margin:0 0 14px;"></p>',
            '  <a id="sb-qr-download" href="#" download style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:7px;border:1px solid #e5e9f0;background:#f9fafb;color:#374151;font-size:13px;font-weight:600;text-decoration:none;">&#8595; Download</a>',
            '</div>'
        ].join('');
        document.body.appendChild(el);

        // Close on backdrop click
        el.addEventListener('click', function (e) {
            if (e.target === el) sbHideQrModal();
        });
        // Close button
        el.querySelector('#sb-qr-close').addEventListener('click', sbHideQrModal);
        // Close on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') sbHideQrModal();
        });

        _qrModal = el;
        return el;
    }

    function sbShowQrModal(keyword, shortUrl) {
        var modal = sbGetQrModal();
        var apiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=' + encodeURIComponent(shortUrl);
        modal.querySelector('.sb-qr-kw').textContent = keyword;
        modal.querySelector('.sb-qr-url').textContent = shortUrl;
        modal.querySelector('#sb-qr-img').src = apiUrl;
        var dl = modal.querySelector('#sb-qr-download');
        if (dl) { dl.href = apiUrl; dl.setAttribute('download', keyword + '-qr.png'); }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function sbHideQrModal() {
        if (_qrModal) _qrModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    // ─────────────────────────────────────────────────────────────────

    ready(function () {
        var pluginsTable = document.querySelector('#main_table tr.plugin, #main_table td.plugin_name, table#plugins_table');
        var isPluginsPage = /\/plugins\.php$/.test(window.location.pathname) && !window.location.search.match(/[?&]page=/);
        if (pluginsTable || isPluginsPage) {
            document.body.classList.add('sb-plugins-page');
        }

        // 1. Tag the main table cells with semantic classes if YOURLS didn't.
        //    YOURLS already uses .keyword, .url, .clicks, .timestamp, .actions
        //    in modern versions — but on some older installs the columns are
        //    just <td> with no class. We add them here for styling.
        var table = document.getElementById('main_table');
        if (table) {
            var headers = table.querySelectorAll('thead th');
            var colClasses = [];
            headers.forEach(function (th) {
                var t = th.textContent.trim().toLowerCase();
                if (t.indexOf('short') !== -1) colClasses.push('keyword');
                else if (t.indexOf('url') !== -1 || t.indexOf('original') !== -1) colClasses.push('url');
                else if (t.indexOf('title') !== -1) colClasses.push('title');
                else if (t.indexOf('click') !== -1) colClasses.push('clicks');
                else if (t.indexOf('date') !== -1 || t.indexOf('time') !== -1) colClasses.push('timestamp');
                else if (t === 'ip' || t.indexOf('ip address') !== -1) colClasses.push('ip');
                else if (t.indexOf('action') !== -1) colClasses.push('actions');
                else colClasses.push('');
            });
            headers.forEach(function (th, i) {
                if (colClasses[i] && !th.classList.contains(colClasses[i])) {
                    th.classList.add(colClasses[i]);
                }
            });
            headers.forEach(function (th) {
                var label = th.textContent.trim().toLowerCase();
                if (label.indexOf('click') !== -1) th.classList.add('clicks');
                if (label.indexOf('action') !== -1) th.classList.add('actions');
            });
            table.querySelectorAll('tbody tr').forEach(function (tr) {
                tr.querySelectorAll('td').forEach(function (td, i) {
                    if (colClasses[i] && !td.classList.contains(colClasses[i])) {
                        td.classList.add(colClasses[i]);
                    }
                });
                var cells = tr.querySelectorAll('td');
                if (cells.length >= 2) {
                    var maybeActions = cells[cells.length - 1];
                    if (maybeActions.querySelector('a.button, button, input[type="button"]')) {
                        maybeActions.classList.add('actions');
                    }
                }
            });
        }

        // 2. Add quick "copy short URL" buttons next to each keyword link.
        var SVG_COPY = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        var SVG_CHECK = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

        function copyTextToClipboard(text, onDone) {
            if (!text) return;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function () {
                    if (onDone) onDone();
                }).catch(function () {
                    if (fallbackCopyText(text) && onDone) onDone();
                });
            } else if (fallbackCopyText(text) && onDone) {
                onDone();
            }
        }

        function enhanceKeywordCopyLinks(root) {
            (root || document).querySelectorAll('#main_table td.keyword a, td.keyword a').forEach(function (a) {
                if (a.dataset.sbCopyDone) return;
                a.dataset.sbCopyDone = '1';
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'sb-copy-btn';
                btn.title = 'Copy short URL';
                btn.innerHTML = SVG_COPY;
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var url = a.href;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(url);
                    } else {
                        var ta = document.createElement('textarea');
                        ta.value = url;
                        document.body.appendChild(ta);
                        ta.select();
                        try { document.execCommand('copy'); } catch (e) { }
                        document.body.removeChild(ta);
                    }
                    // Feedback
                    btn.dataset.copied = '1';
                    btn.classList.add('sb-copy-copied');
                    btn.innerHTML = SVG_CHECK;
                    setTimeout(function () {
                        delete btn.dataset.copied;
                        btn.classList.remove('sb-copy-copied');
                        btn.innerHTML = SVG_COPY;
                    }, 2000);
                });
                a.parentNode.insertBefore(btn, a.nextSibling);
            });
        }

        enhanceKeywordCopyLinks();

        function looksLikeUrl(value) {
            return /^https?:\/\//i.test((value || '').trim());
        }

        function enhanceOriginalUrlCells(root) {
            var scope = root || document;
            var cells = [];

            if (scope.matches && scope.matches('td.url')) {
                cells.push(scope);
            }
            Array.prototype.push.apply(cells, Array.prototype.slice.call(scope.querySelectorAll('td.url')));

            cells.forEach(function (cell) {
                if (cell.dataset.sbOriginalUrlEnhanced) return;
                cell.dataset.sbOriginalUrlEnhanced = '1';

                var links = Array.prototype.slice.call(cell.querySelectorAll('a[href]'));
                if (!links.length) return;

                var titleLink = links[0];
                var originalLink = links[links.length - 1];
                var small = originalLink.closest ? originalLink.closest('small') : null;

                cell.classList.add('sb-destination-cell');
                titleLink.classList.add('sb-destination-title');
                originalLink.classList.add('sb-destination-url');
                if (small) small.classList.add('sb-destination-url-wrap');

                var fullTitle = titleLink.getAttribute('title');
                var fullUrl = originalLink.href;

                if (fullTitle) {
                    titleLink.textContent = fullTitle;
                    titleLink.setAttribute('title', fullTitle);
                }
                if (fullUrl) {
                    originalLink.textContent = fullUrl;
                    originalLink.setAttribute('title', fullUrl);
                }

                titleLink.style.display = '';
                updateOverflowHint(titleLink, fullTitle || titleLink.textContent);
                updateOverflowHint(originalLink, fullUrl || originalLink.textContent);
            });
        }

        function updateOverflowHint(el, value) {
            if (!el || !value) return;
            window.requestAnimationFrame(function () {
                if (el.scrollWidth > el.clientWidth + 1) {
                    el.setAttribute('title', value);
                } else {
                    el.removeAttribute('title');
                }
            });
        }

        enhanceOriginalUrlCells();

        // 2b. Style action buttons + add QR code button to each row.
        var SVG_EDIT = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
        var SVG_DELETE = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
        var SVG_QR = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/><rect x="14" y="14" width="3" height="3" fill="currentColor" stroke="none"/><rect x="19" y="17" width="2" height="2" fill="currentColor" stroke="none"/><rect x="17" y="19" width="4" height="2" fill="currentColor" stroke="none"/></svg>';
        var SVG_SHARE = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';

        var BASE_BTN_STYLE = 'display:inline-flex!important;align-items:center;justify-content:center;width:28px;height:28px;border-radius:5px;border:none;background:transparent;color:#6b7280;padding:0;margin:1px;text-decoration:none;transition:color .15s,background .15s;vertical-align:middle;box-sizing:border-box;';

        function applyBtnHover(el, hoverColor) {
            el.addEventListener('mouseenter', function () {
                el.style.color = hoverColor;
                el.style.background = hoverColor === '#ef4444' ? 'rgba(239,68,68,.08)' : 'rgba(30,135,240,.08)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.color = '#6b7280';
                el.style.background = 'transparent';
            });
        }

        // Clean up "Optional : Custom short URL" label → "Custom short URL"
        var kwLabel = document.querySelector('label[for="add-keyword"]');
        if (kwLabel) {
            kwLabel.innerHTML = '<strong>Custom short URL</strong>';
        }

        // Rename "Shorten The URL" button → "Shorten"
        var addBtn = document.getElementById('add-button');
        if (addBtn) addBtn.value = 'Shorten';

        // Normalize the add URL form so CSS grid can make it responsive.
        var newUrlForm = document.getElementById('new_url');
        if (newUrlForm) {
            newUrlForm.querySelectorAll('p').forEach(function (p) {
                Array.prototype.slice.call(p.childNodes).forEach(function (node) {
                    if (node.nodeType === 3 && node.textContent.trim() === ':') {
                        node.parentNode.removeChild(node);
                    }
                });
            });
        }

        // Let CSS control responsive input widths.
        var urlInput = document.getElementById('add-url');
        if (urlInput) urlInput.removeAttribute('size');
        var kwInput = document.getElementById('add-keyword');
        if (kwInput) kwInput.removeAttribute('size');
        var RESERVED_KEYWORDS = ['kuscc'];

        function isReservedKeyword(value) {
            return RESERVED_KEYWORDS.indexOf((value || '').trim().toLowerCase()) !== -1;
        }

        var reservedMessage = 'The custom short URL "kuscc" is reserved because it duplicates the hosting name.';

        function refreshReservedKeywordState() {
            if (!kwInput) return false;
            var reserved = isReservedKeyword(kwInput.value);
            kwInput.setCustomValidity(reserved ? reservedMessage : '');
            if (addBtn) addBtn.disabled = reserved;
            return reserved;
        }

        function stopReservedKeywordAction(event) {
            if (!refreshReservedKeywordState()) return false;
            if (kwInput) kwInput.reportValidity();
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            return true;
        }

        if (kwInput) {
            refreshReservedKeywordState();
            kwInput.addEventListener('input', refreshReservedKeywordState);
        }

        if (newUrlForm && kwInput) {
            newUrlForm.addEventListener('submit', stopReservedKeywordAction, true);
        }

        if (addBtn && kwInput) {
            addBtn.addEventListener('click', stopReservedKeywordAction, true);
        }

        function setActionIcon(link, iconSvg) {
            link.innerHTML = iconSvg;
            link.style.cssText = BASE_BTN_STYLE;
            link.querySelectorAll('svg, svg *').forEach(function (el) {
                el.style.pointerEvents = 'none';
            });
        }

        function getShareCopyText(tr) {
            var keywordLink = tr.querySelector('td.keyword a');
            var shortUrl = keywordLink ? keywordLink.href.replace(/\/$/, '') : '';
            if (!shortUrl) return '';

            var titleEl = tr.querySelector('td.url .sb-destination-title, td.url a:first-of-type');
            var title = titleEl ? titleEl.textContent.trim() : '';
            if (!title || looksLikeUrl(title)) {
                title = keywordLink ? keywordLink.textContent.trim() : '';
            }

            return (title ? title + '\n' : '') + shortUrl;
        }

        function attachShareCopyHandler(link, tr) {
            if (link.dataset.sbShareCopyDone) return;
            link.dataset.sbShareCopyDone = '1';
            link.title = 'Copy title and short URL';
            link.setAttribute('aria-label', 'Copy title and short URL');
            link.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                var text = getShareCopyText(tr);
                copyTextToClipboard(text, function () {
                    setActionIcon(link, SVG_CHECK);
                    link.classList.add('sb-copy-copied');
                    showToast('Copied share text');
                    setTimeout(function () {
                        link.classList.remove('sb-copy-copied');
                        setActionIcon(link, SVG_SHARE);
                    }, 1600);
                });
            }, true);
        }

        function isDeleteLink(link) {
            if (!link || !link.href) return false;
            var cls = link.className || '';
            if (cls.indexOf('button_delete') !== -1 || cls.indexOf('button-delete') !== -1) return true;
            if (link.title && link.title.toLowerCase() === 'delete') return true;
            return /admin-ajax\.php/.test(link.href) && /[?&]action=delete(?:&|$)/.test(link.href);
        }

        function deleteDialogIsOpen() {
            var dialogs = document.querySelectorAll('.ui-dialog, #delete-confirm-dialog');
            return Array.prototype.some.call(dialogs, function (dialog) {
                var style = window.getComputedStyle(dialog);
                return style.display !== 'none' && style.visibility !== 'hidden' && (dialog.offsetWidth > 0 || dialog.offsetHeight > 0);
            });
        }

        function fallbackDeleteLink(link) {
            var row = link.closest('tr');
            var keyword = '';
            try {
                keyword = new URL(link.href).searchParams.get('keyword') || '';
            } catch (e) {}

            if (!window.confirm('Delete short URL' + (keyword ? ' "' + keyword + '"' : '') + '?')) return;

            fetch(link.href, {
                credentials: 'same-origin',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (!data || Number(data.success) !== 1) {
                    throw new Error('Delete failed');
                }
                if (row && row.parentNode) row.parentNode.removeChild(row);
                showToast('Deleted' + (keyword ? ' ' + keyword : ''));
            }).catch(function () {
                window.alert('Delete failed. Please refresh and try again.');
            });
        }

        document.addEventListener('click', function (event) {
            var link = event.target.closest && event.target.closest('a');
            if (!isDeleteLink(link)) return;

            event.preventDefault();

            window.setTimeout(function () {
                if (!document.body.contains(link) || deleteDialogIsOpen()) return;
                fallbackDeleteLink(link);
            }, 500);
        }, true);

        function enhanceActionRows(root) {
            var scope = root || document;
            var rows = [];
            if (scope.matches && scope.matches('#main_table tbody tr, tbody tr')) {
                rows.push(scope);
            }
            Array.prototype.push.apply(rows, Array.prototype.slice.call(scope.querySelectorAll('#main_table tbody tr, tbody tr')));

            rows.forEach(function (tr) {
                if (tr.dataset.sbQrDone) return;
                tr.dataset.sbQrDone = '1';

                var actionsTd = tr.querySelector('td.actions');
                if (!actionsTd) return;

                // Replace text on existing Edit / Delete / Share buttons with SVG icons
                actionsTd.querySelectorAll('a').forEach(function (a) {
                    var cls = a.className || '';
                    if (cls.indexOf('button_link_display') !== -1 || cls.indexOf('button-edit') !== -1 || (a.title && a.title.toLowerCase() === 'edit')) {
                        setActionIcon(a, SVG_EDIT);
                        applyBtnHover(a, 'var(--sb-accent,#1e87f0)');
                    } else if (cls.indexOf('button_delete') !== -1 || cls.indexOf('button-delete') !== -1 || (a.title && a.title.toLowerCase() === 'delete')) {
                        setActionIcon(a, SVG_DELETE);
                        applyBtnHover(a, '#ef4444');
                    } else if (cls.indexOf('button_share') !== -1 || cls.indexOf('button-share') !== -1 || (a.title && a.title.toLowerCase() === 'share')) {
                        setActionIcon(a, SVG_SHARE);
                        attachShareCopyHandler(a, tr);
                        applyBtnHover(a, 'var(--sb-accent,#1e87f0)');
                    }
                });

                // Add QR button — opens popup modal
                var keywordLink = tr.querySelector('td.keyword a');
                if (!keywordLink) return;
                var shortUrl = keywordLink.href.replace(/\/$/, '');
                var keyword  = keywordLink.textContent.trim();

                var btn = document.createElement('a');
                btn.href = '#';
                btn.className = 'sb-qr-btn';
                btn.title = 'QR Code';
                setActionIcon(btn, SVG_QR);
                applyBtnHover(btn, 'var(--sb-accent,#1e87f0)');
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    sbShowQrModal(keyword, shortUrl);
                });

                // Insert as first button in the actions cell
                actionsTd.insertBefore(btn, actionsTd.firstChild);
            });
        }

        enhanceActionRows();

        function getCurrentUserLabel() {
            var userEl = document.querySelector('.sb-username, .sb-user-dropdown-name');
            if (userEl && userEl.textContent.trim()) return userEl.textContent.trim();

            var match = document.cookie.match(/(?:^|;\s*)yourls_username=([^;]+)/);
            if (match) {
                try { return decodeURIComponent(match[1].replace(/\+/g, ' ')); } catch (e) {}
                return match[1];
            }

            return '';
        }

        function enhanceUserColumnRows(root, users) {
            var scope = root || document;
            var rows = [];
            if (scope.matches && scope.matches('#main_table tbody tr, tbody tr')) {
                rows.push(scope);
            }
            Array.prototype.push.apply(rows, Array.prototype.slice.call(scope.querySelectorAll('#main_table tbody tr, tbody tr')));

            rows.forEach(function (tr) {
                var firstTd = tr.querySelector('td');
                if (!firstTd) return;

                if (firstTd.colSpan > 1) {
                    if (!tr.dataset.sbUserColspanDone) {
                        firstTd.colSpan = parseInt(firstTd.colSpan, 10) + 1;
                        tr.dataset.sbUserColspanDone = '1';
                    }
                    return;
                }

                var td = tr.querySelector('td.sb-col-user');
                if (!td) {
                    td = document.createElement('td');
                    td.className = 'sb-col-user';
                    tr.appendChild(td);
                }

                var keywordLink = tr.querySelector('td.keyword a');
                var keyword = keywordLink ? keywordLink.textContent.trim() : null;
                var user = keyword && users && users[keyword] ? users[keyword] : '';
                if (!user && !tr.dataset.sbExistingUserRow) user = getCurrentUserLabel();

                if (user) {
                    td.textContent = user;
                } else {
                    td.innerHTML = '<span style="opacity:.4">—</span>';
                }
            });
        }

        // 2c. Inject USER column into main_table using data from PHP
        (function () {
            var users = window._yourlsUsers;
            if (!users) return;
            var table = document.getElementById('main_table');
            if (!table) return;

            // Add <th> after ACTIONS header
            var headerRow = table.querySelector('thead tr');
            if (headerRow) {
                var th = document.createElement('th');
                th.textContent = 'User';
                th.className = 'sb-col-user';
                headerRow.appendChild(th);
            }

            table.querySelectorAll('tbody tr').forEach(function (tr) {
                tr.dataset.sbExistingUserRow = '1';
            });
            enhanceUserColumnRows(table, users);

            // Fix tfoot colspan to match new column count
            table.querySelectorAll('tfoot td[colspan], tfoot th[colspan]').forEach(function (cell) {
                cell.colSpan = parseInt(cell.colSpan, 10) + 1;
            });
        }());

        var mainTableBody = document.querySelector('#main_table tbody');
        if (mainTableBody) {
            var mainTableObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType !== 1) return;
                        enhanceKeywordCopyLinks(node);
                        enhanceOriginalUrlCells(node);
                        enhanceActionRows(node);
                        enhanceUserColumnRows(node, window._yourlsUsers || {});
                    });
                });
            });
            mainTableObserver.observe(mainTableBody, { childList: true });
        }

        // 2c. Swap bolt icon + domain text in navbar with the YOURLS logo image.
        (function () {
            var logoImg = document.getElementById('yourls-logo');
            var navBrand = document.querySelector('.sb-logo');
            if (!logoImg || !navBrand) return;

            var cloned = logoImg.cloneNode(true);
            cloned.id = 'sb-navbar-logo';
            cloned.style.cssText = 'display:block;height:70px;width:auto;object-fit:contain;';

            var icon = navBrand.querySelector('.sb-logo-icon');
            var text = navBrand.querySelector('.sb-logo-text');
            if (icon) icon.remove();
            if (text) text.remove();
            navBrand.insertBefore(cloned, navBrand.firstChild);
        }());

        // 3. Add a body class on the login page so the CSS can re-style it.
        if (document.body && document.querySelector('form#login')) {
            document.body.classList.add('login');
            var loginLogo = document.getElementById('yourls-logo');
            var loginTitleLink = document.querySelector('h1 a');
            var loginTitle = document.querySelector('header h1, h1');
            var loginHeader = document.querySelector('header[role="banner"], header');
            var loginTitleText = loginTitleLink ? loginTitleLink.textContent.replace(/\s+/g, ' ').trim().replace(/^YOURLS:\s*/i, '') : '';
            if (loginLogo && loginTitle && loginHeader && loginLogo.nextElementSibling !== loginTitle) {
                loginHeader.insertBefore(loginLogo, loginTitle);
            }
            if (loginTitleLink) {
                loginTitleLink.querySelectorAll('br').forEach(function (br) {
                    br.remove();
                });
                Array.prototype.slice.call(loginTitleLink.childNodes).forEach(function (node) {
                    if (node.nodeType === 3) {
                        node.textContent = '';
                    } else if (node.nodeType === 1 && node.tagName !== 'IMG' && node.id !== 'yourls-logo') {
                        node.textContent = '';
                    }
                });
            }
            if (loginLogo && loginTitleText && !document.querySelector('.sb-login-subtitle')) {
                var subtitle = document.createElement('div');
                subtitle.className = 'sb-login-subtitle';
                subtitle.textContent = loginTitleText;
                loginLogo.insertAdjacentElement('afterend', subtitle);
            }

        }

        // 4. Tag the stock YOURLS public front page so the skin can lay it out.
        var publicForm = document.querySelector('form input[name="url"]');
        var hasBookmarklets = document.querySelector('a.bookmarklet');
        if (document.body && publicForm && hasBookmarklets && !document.body.classList.contains('login')) {
            document.body.classList.add('public-site');
            var shortenForm = publicForm.closest('form');
            if (shortenForm) shortenForm.classList.add('sb-public-form');

            if (!document.querySelector('.sb-public-admin-link')) {
                var adminLink = document.createElement('a');
                adminLink.className = 'sb-public-admin-link';
                adminLink.href = new URL('admin/', window.location.href).href;
                adminLink.textContent = 'Admin';
                adminLink.setAttribute('aria-label', 'Go to admin page');

                var publicTitle = null;
                document.querySelectorAll('h2').forEach(function (h2) {
                    if (!publicTitle && h2.textContent.trim().toLowerCase().indexOf('enter a new url') !== -1) {
                        publicTitle = h2;
                    }
                });

                if (publicTitle && publicTitle.parentNode) {
                    publicTitle.parentNode.insertBefore(adminLink, publicTitle);
                } else if (shortenForm && shortenForm.parentNode) {
                    shortenForm.parentNode.insertBefore(adminLink, shortenForm);
                } else {
                    document.body.insertBefore(adminLink, document.body.firstChild);
                }
            }

            document.querySelectorAll('h2').forEach(function (h2) {
                var text = h2.textContent.trim().toLowerCase();
                if (text.indexOf('enter a new url') !== -1) h2.classList.add('sb-public-title');
                if (text.indexOf('bookmarklets') !== -1) {
                    h2.classList.add('sb-public-section-title');
                    var intro = h2.nextElementSibling;
                    var links = intro ? intro.nextElementSibling : null;
                    if (intro) intro.classList.add('sb-bookmarklet-intro');
                    if (links) links.classList.add('sb-bookmarklet-list');
                }
                if (text.indexOf('please note') !== -1) {
                    h2.classList.add('sb-public-section-title', 'sb-note-title');
                    if (h2.nextElementSibling) h2.nextElementSibling.classList.add('sb-public-note');
                }
            });
        }

        // 5. Normalize the YOURLS filter footer into rows for reliable styling.
        var filterOptions = document.getElementById('filter_options');
        if (filterOptions && !filterOptions.dataset.sbRowsDone) {
            filterOptions.dataset.sbRowsDone = '1';
            var rows = [];
            var currentRow = document.createElement('div');
            currentRow.className = 'sb-filter-row sb-filter-row-1';

            function appendFilterText(row, text) {
                var cleanText = text.replace(/\s+/g, ' ').trim();
                if (!cleanText) return;

                var span = document.createElement('span');
                span.className = 'sb-filter-text';
                span.textContent = cleanText;
                row.appendChild(span);
            }

            function pushFilterRow() {
                if (!currentRow.childNodes.length) return;
                rows.push(currentRow);
                currentRow = document.createElement('div');
                currentRow.className = 'sb-filter-row sb-filter-row-' + (rows.length + 1);
            }

            Array.prototype.slice.call(filterOptions.childNodes).forEach(function (node) {
                if (node.nodeName === 'BR') {
                    pushFilterRow();
                    return;
                }

                if (node.nodeType === 3 && /[-–—]/.test(node.textContent)) {
                    node.textContent.split(/\s*[-–—]\s*/).forEach(function (part, index) {
                        if (index > 0) pushFilterRow();
                        appendFilterText(currentRow, part);
                    });
                    return;
                }

                if (node.nodeType === 3) {
                    appendFilterText(currentRow, node.textContent);
                    return;
                }

                currentRow.appendChild(node);
            });

            if (currentRow.childNodes.length) rows.push(currentRow);
            while (filterOptions.firstChild) {
                filterOptions.removeChild(filterOptions.firstChild);
            }
            rows.forEach(function (row) { filterOptions.appendChild(row); });
        }

        // 5b. Merge "Display X to Y of Z URLs." + "Overall, tracking..." onto one line.
        var overallP = document.getElementById('overall_tracking');
        if (overallP && overallP.previousElementSibling && overallP.previousElementSibling.tagName === 'P') {
            var displayP = overallP.previousElementSibling;
            // Append a separator + overall content into displayP, then remove overallP
            var sep = document.createTextNode(' — ');
            displayP.appendChild(sep);
            while (overallP.firstChild) {
                displayP.appendChild(overallP.firstChild);
            }
            overallP.parentNode.removeChild(overallP);
        }

        // 6. Polish the "share" buttons row if present.
        document.querySelectorAll('#shareboxes .share-button, .button-share').forEach(function (el) {
            el.classList.add('uk-button', 'uk-button-default', 'uk-button-small');
        });

        // 6b. Inject override styles last in CSSOM so they win over admin.css + inline styles
        (function () {
            var s = document.createElement('style');
            s.id = 'sb-sharebox-overrides';
            s.textContent = [
                /* Keep YOURLS' full sharebox content, hidden until Share is clicked */
                '#shareboxes {',
                '  display: none !important;',
                '  width: 100% !important;',
                '  height: auto !important;',
                '  box-sizing: border-box !important;',
                '  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;',
                '  align-items: stretch !important;',
                '  gap: 24px !important;',
                '  padding: 8px 0 !important;',
                '  background: transparent !important;',
                '  border: none !important;',
                '  border-radius: var(--sb-radius) !important;',
                '  box-shadow: none !important;',
                '  min-height: 0 !important;',
                '  color: #585646 !important;',
                '}',
                '#shareboxes.sb-shareboxes-active {',
                '  display: grid !important;',
                '}',
                '#your_short_link, #quick_share {',
                '  float: none !important;',
                '  width: 100% !important;',
                '  height: auto !important;',
                '  max-width: none !important;',
                '  min-width: 0 !important;',
                '  min-height: 0 !important;',
                '  box-sizing: border-box !important;',
                '  border: 2px solid #8ec3ee !important;',
                '  border-radius: 6px !important;',
                '  outline: none !important;',
                '  box-shadow: none !important;',
                '  background: #fff !important;',
                '  padding: 20px 24px !important;',
                '  margin: 0 !important;',
                '  display: block !important;',
                '  color: #585646 !important;',
                '  overflow: hidden !important;',
                '}',
                '#shareboxes h2 { display: block !important; margin: 0 0 24px !important; color: #585646 !important; font-size: 28px !important; font-weight: 700 !important; line-height: 1.15 !important; }',
                '#your_short_link p ~ p { display: block !important; }',
                '#your_short_link p {',
                '  display: block !important;',
                '  margin: 0 0 18px !important;',
                '  padding: 0 !important;',
                '  color: #585646 !important;',
                '  overflow-wrap: anywhere !important;',
                '  word-break: break-word !important;',
                '}',
                '#your_short_link a {',
                '  overflow-wrap: anywhere !important;',
                '  word-break: break-word !important;',
                '}',
                /* Short URL input */
                '#short_url {',
                '  width: 100% !important;',
                '  max-width: 100% !important;',
                '  box-sizing: border-box !important;',
                '  min-height: 44px !important;',
                '  font-size: 16px !important;',
                '  font-weight: 400 !important;',
                '  padding: 10px 14px !important;',
                '  border: 1px solid var(--sb-border) !important;',
                '  border-radius: 6px !important;',
                '  background: #fff !important;',
                '  color: var(--sb-text) !important;',
                '  outline: none !important;',
                '  box-shadow: none !important;',
                '  overflow: hidden !important;',
                '  text-overflow: ellipsis !important;',
                '}',
                '#short_url:focus {',
                '  border-color: var(--sb-accent, #1e87f0) !important;',
                '  box-shadow: 0 0 0 3px rgba(30, 135, 240, 0.12) !important;',
                '}',
                '#shareboxes textarea {',
                '  display: inline-block !important;',
                '  width: calc(100% - 86px) !important;',
                '  min-height: 104px !important;',
                '  box-sizing: border-box !important;',
                '  border: 1px solid var(--sb-border) !important;',
                '  border-radius: 6px !important;',
                '  background: #fff !important;',
                '  color: var(--sb-text) !important;',
                '  font-size: 16px !important;',
                '  line-height: 1.45 !important;',
                '  padding: 10px 14px !important;',
                '  outline: none !important;',
                '  resize: vertical !important;',
                '  box-shadow: none !important;',
                '  vertical-align: top !important;',
                '}',
                '#shareboxes textarea:focus {',
                '  border-color: var(--sb-accent, #1e87f0) !important;',
                '  box-shadow: 0 0 0 3px rgba(30, 135, 240, 0.12) !important;',
                '}',
                '#yourls_share_char_count {',
                '  display: inline-flex !important;',
                '  align-items: center !important;',
                '  justify-content: center !important;',
                '  min-width: 74px !important;',
                '  min-height: 44px !important;',
                '  box-sizing: border-box !important;',
                '  margin-left: 8px !important;',
                '  padding: 0 14px !important;',
                '  border: 1px solid rgba(30, 135, 240, 0.45) !important;',
                '  border-radius: 6px !important;',
                '  background: #fff !important;',
                '  color: var(--sb-accent) !important;',
                '  font-size: 13px !important;',
                '  font-weight: 700 !important;',
                '  line-height: 1 !important;',
                '  text-align: center !important;',
                '  text-decoration: none !important;',
                '  vertical-align: top !important;',
                '  white-space: nowrap !important;',
                '  cursor: pointer !important;',
                '  user-select: none !important;',
                '}',
                '#yourls_share_char_count:hover, #yourls_share_char_count:focus {',
                '  border-color: var(--sb-accent) !important;',
                '  background: rgba(30, 135, 240, 0.06) !important;',
                '  color: var(--sb-accent) !important;',
                '  outline: none !important;',
                '}',
                '#yourls_share_char_count.copied {',
                '  border-color: #10b981 !important;',
                '  background: #10b981 !important;',
                '  color: #fff !important;',
                '}',
                '#your_title { display: none !important; }',
                /* Hide extra YOURLS paragraphs directly under the sharebox wrapper */
                '#shareboxes > p { display: none !important; }',
                '#quick_share p {',
                '  display: flex !important;',
                '  align-items: center !important;',
                '  flex-wrap: wrap !important;',
                '  gap: 8px !important;',
                '  margin: 20px 0 0 !important;',
                '  padding: 0 !important;',
                '  color: #585646 !important;',
                '  font-size: 18px !important;',
                '}',
                '@media (max-width: 860px) {',
                '  #shareboxes { grid-template-columns: minmax(0, 1fr) !important; }',
                '}',
            ].join('\n');
            document.head.appendChild(s);
        }());

        // 6c-pre. Inject jQuery UI dialog overrides via JS (runs after all CSS, guaranteed to win)
        (function () {
            var d = document.createElement('style');
            d.id = 'sb-dialog-overrides';
            d.textContent = [
                /* Native YOURLS delete dialog */
                '#delete-confirm-dialog{',
                '  padding:0!important;overflow:hidden!important;box-sizing:border-box!important;',
                '}',
                '#delete-confirm-dialog .confirm-message{',
                '  padding:24px 48px 0!important;box-sizing:border-box!important;',
                '}',
                '#delete-confirm-dialog .button-group{',
                '  width:100%!important;max-width:none!important;margin:32px 0 0!important;',
                '  padding:28px 32px!important;box-sizing:border-box!important;',
                '  display:flex!important;align-items:center!important;justify-content:center!important;gap:28px!important;',
                '  float:none!important;clear:both!important;background:#e0f2ff!important;',
                '  border:none!important;border-top:1px solid #bfdbfe!important;',
                '}',
                '#delete-confirm-dialog .button-group input[type=button],',
                '#delete-confirm-dialog .button-group input[type=reset],',
                '#delete-confirm-dialog .button-group input[type=submit]{',
                '  margin:0!important;',
                '}',
                /* Outer dialog shell */
                '.ui-dialog,.ui-widget.ui-dialog{',
                '  background:#fff!important;background-image:none!important;',
                '  border-radius:10px!important;border:1px solid #e5e9f0!important;',
                '  box-shadow:0 8px 32px rgba(15,23,42,.14)!important;',
                '  padding:0!important;overflow:hidden!important;font-family:inherit!important;',
                '}',
                /* Title bar */
                '.ui-dialog .ui-dialog-titlebar,.ui-dialog .ui-widget-header{',
                '  background:#1e87f0!important;background-image:none!important;',
                '  border:none!important;border-radius:0!important;',
                '  padding:13px 20px!important;',
                '}',
                '.ui-dialog .ui-dialog-title{',
                '  color:#fff!important;font-size:15px!important;font-weight:700!important;',
                '}',
                '.ui-dialog .ui-dialog-titlebar-close{',
                '  background:transparent!important;border:none!important;box-shadow:none!important;',
                '}',
                /* Content area */
                '.ui-dialog .ui-dialog-content,.ui-dialog #confirm{',
                '  background:#fff!important;border:none!important;',
                '  padding:20px 24px!important;',
                '}',
                /* Button group (YOURLS .button-group inside dialog) */
                '.ui-dialog .button-group{',
                '  background:#f9fafb!important;background-image:none!important;',
                '  border:none!important;border-top:1px solid #e5e9f0!important;',
                '  padding:12px 20px!important;margin:0!important;',
                '  width:100%!important;max-width:none!important;box-sizing:border-box!important;',
                '  display:flex!important;gap:8px!important;align-items:center!important;justify-content:center!important;',
                '  float:none!important;clear:both!important;',
                '}',
                '.ui-dialog .ui-dialog-content .button-group,.ui-dialog #confirm .button-group{',
                '  width:calc(100% + 48px)!important;',
                '  margin:24px -24px -20px!important;',
                '  border-radius:0 0 10px 10px!important;',
                '}',
                /* Buttons inside dialog */
                '.ui-dialog .button-group input[type=button],',
                '.ui-dialog .button-group input[type=reset],',
                '.ui-dialog .button-group input[type=submit]{',
                '  border-radius:6px!important;border:none!important;',
                '  background-image:none!important;font-family:inherit!important;',
                '  font-weight:600!important;font-size:13px!important;',
                '  padding:8px 20px!important;cursor:pointer!important;',
                '  box-shadow:none!important;text-shadow:none!important;outline:none!important;',
                '}',
                '.ui-dialog .button-group input.button.primary{',
                '  background:#ef4444!important;color:#fff!important;',
                '}',
                '.ui-dialog .button-group input[type=reset]{',
                '  background:#6b7280!important;color:#fff!important;',
                '}',
                /* Remove tt/code styling in dialog */
                '.ui-dialog tt,.ui-dialog code,.ui-dialog #confirm tt,.ui-dialog #confirm code{',
                '  background:transparent!important;border:none!important;',
                '  padding:0!important;font-family:inherit!important;',
                '  box-shadow:none!important;border-radius:0!important;',
                '}',
            ].join('\n');
            document.head.appendChild(d);
        }());

        // 6c. Rebuild shareboxes into a compact single-row layout using inline styles.
        function enhanceShareboxes() {
            var shareboxes = document.getElementById('shareboxes');
            if (!shareboxes) return;
            if (!shareboxes.classList.contains('sb-shareboxes-active')) return;
            if (shareboxes.dataset.sbEnhanced) return;
            shareboxes.dataset.sbEnhanced = '1';

            // --- Style the outer container ---
            shareboxes.style.cssText = 'display:grid!important;width:100%!important;height:auto!important;box-sizing:border-box;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:stretch;gap:24px;padding:8px 0;background:transparent;border:none;border-radius:10px;box-shadow:none;margin-top:8px;color:#585646;';

            shareboxes.querySelectorAll('.sb-copy-short-url').forEach(function (btn) { btn.remove(); });

            // --- your_short_link: keep all stock content visible ---
            var shortLinkBox = document.getElementById('your_short_link');
            if (shortLinkBox) {
                shortLinkBox.style.cssText = 'float:none!important;width:100%!important;height:auto!important;max-width:none!important;min-width:0;min-height:0;border:2px solid #8ec3ee!important;border-radius:6px;background:#fff!important;box-shadow:none!important;padding:20px 24px!important;margin:0!important;display:block;box-sizing:border-box;color:#585646;overflow:hidden;';
                shortLinkBox.querySelectorAll('h2').forEach(function(h){ h.style.cssText='display:block!important;margin:0 0 24px!important;color:#585646!important;font-size:28px!important;font-weight:700!important;line-height:1.15!important;'; });
                var ps = shortLinkBox.querySelectorAll('p');
                ps.forEach(function(p){ p.style.cssText = 'display:block!important;margin:0 0 18px!important;padding:0!important;color:#585646!important;font-size:15px;line-height:1.45;overflow-wrap:anywhere;word-break:break-word;'; });
                shortLinkBox.querySelectorAll('a').forEach(function(a){ a.style.overflowWrap = 'anywhere'; a.style.wordBreak = 'break-word'; });
            }

            // --- Style #short_url input ---
            var shortUrlInput = document.getElementById('short_url');
            if (shortUrlInput) {
                shortUrlInput.style.cssText = 'width:100%!important;max-width:100%;min-height:44px;font-size:16px;font-weight:400;padding:10px 14px;border:1px solid var(--sb-border)!important;border-radius:6px;background:#fff;color:var(--sb-text);outline:none;box-shadow:none;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box;';
            }

            // --- quick_share: keep textarea, character count, and share links visible ---
            var quickShare = document.getElementById('quick_share');
            if (quickShare) {
                quickShare.style.cssText = 'float:none!important;width:100%!important;height:auto!important;max-width:none!important;min-width:0;min-height:0;border:2px solid #8ec3ee!important;border-radius:6px;background:#fff!important;box-shadow:none!important;padding:20px 24px!important;margin:0!important;display:block;box-sizing:border-box;color:#585646;overflow:hidden;';
                quickShare.querySelectorAll('h2').forEach(function(h){ h.style.cssText='display:block!important;margin:0 0 24px!important;color:#585646!important;font-size:28px!important;font-weight:700!important;line-height:1.15!important;'; });
                var ta = quickShare.querySelector('textarea');
                if (ta) ta.style.cssText = 'display:inline-block!important;width:calc(100% - 86px)!important;min-height:104px;box-sizing:border-box;border:1px solid var(--sb-border)!important;border-radius:6px;background:#fff;color:var(--sb-text);font-size:16px;line-height:1.45;padding:10px 14px;outline:none;resize:vertical;box-shadow:none;vertical-align:top;';
                var charCount = document.getElementById('yourls_share_char_count');
                if (charCount) {
                    charCount.textContent = 'Copy';
                    charCount.setAttribute('role', 'button');
                    charCount.setAttribute('tabindex', '0');
                    charCount.setAttribute('aria-label', 'Copy share text');
                    charCount.style.cssText = 'display:inline-flex!important;align-items:center;justify-content:center;min-width:74px;min-height:44px;box-sizing:border-box;margin-left:8px;padding:0 14px;border:1px solid rgba(30,135,240,.45);border-radius:6px;background:#fff;color:var(--sb-accent)!important;font-size:13px;font-weight:700;line-height:1;text-align:center;text-decoration:none;vertical-align:top;white-space:nowrap;cursor:pointer;user-select:none;';

                    if (!charCount.dataset.sbCopyBound) {
                        charCount.dataset.sbCopyBound = '1';
                        var copyShareText = function () {
                            var text = ta ? ta.value : '';
                            if (!text) return;
                            if (navigator.clipboard) {
                                navigator.clipboard.writeText(text);
                            } else if (ta) {
                                ta.select();
                                try { document.execCommand('copy'); } catch (e) {}
                            }
                            charCount.classList.add('copied');
                            charCount.textContent = 'Copied';
                            setTimeout(function () {
                                charCount.classList.remove('copied');
                                charCount.textContent = 'Copy';
                            }, 1600);
                        };
                        charCount.addEventListener('click', copyShareText);
                        charCount.addEventListener('keydown', function (event) {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                copyShareText();
                            }
                        });
                    }
                }
                // Style the <p> containing share links
                quickShare.querySelectorAll('p').forEach(function(p){
                    p.style.cssText = 'display:flex!important;align-items:center;flex-wrap:wrap;gap:8px;margin:20px 0 0!important;padding:0!important;color:#585646!important;font-size:18px;line-height:1.2;';
                });
            }

            // --- shareboxes > p (YOURLS injects extra <p> directly into #shareboxes) ---
            shareboxes.querySelectorAll(':scope > p').forEach(function(p){ p.style.display='none'; });

            // --- Style Twitter / Facebook buttons ---
            var tw = document.getElementById('twitter_share') || shareboxes.querySelector('a[id*="twitter"]');
            if (tw) tw.style.cssText = 'display:inline-flex!important;align-items:center;gap:5px;padding:0;border-radius:0;background:transparent;color:#2c7fb2!important;font-size:18px;font-weight:700;text-decoration:none!important;white-space:nowrap;';
            var fb = document.getElementById('facebook_share') || shareboxes.querySelector('a[id*="facebook"]');
            if (fb) fb.style.cssText = 'display:inline-flex!important;align-items:center;gap:5px;padding:0;border-radius:0;background:transparent;color:#2c7fb2!important;font-size:18px;font-weight:700;text-decoration:none!important;white-space:nowrap;';
        }

        // Toast notification helper
        function showToast(msg, color) {
            var t = document.createElement('div');
            t.textContent = msg;
            t.className = 'sb-toast';
            document.body.appendChild(t);
            setTimeout(function () {
                t.style.opacity = '0';
                t.style.transform = 'translateY(8px)';
                setTimeout(function () { t.parentNode && t.parentNode.removeChild(t); }, 250);
            }, 2200);
        }

        // Auto-copy short URL after Shorten button click
        var shareboxObs = document.getElementById('shareboxes');

        function fallbackCopyText(text) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();

            var copied = false;
            try {
                copied = document.execCommand('copy');
            } catch (e) {}

            document.body.removeChild(ta);
            return copied;
        }

        var lastCopiedShortUrl = '';
        var lastCopiedAt = 0;

        function doCopyShortUrl(url) {
            if (!url) return;
            var now = Date.now();
            if (url === lastCopiedShortUrl && now - lastCopiedAt < 3000) return;
            lastCopiedShortUrl = url;
            lastCopiedAt = now;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(function () {
                    showToast('Copied ' + url);
                }).catch(function () {
                    if (fallbackCopyText(url)) {
                        showToast('Copied ' + url);
                    }
                });
            } else {
                if (fallbackCopyText(url)) {
                    showToast('Copied ' + url);
                }
            }
        }

        function getCurrentShortUrlValue() {
            var copyLink = document.getElementById('copylink');
            if (copyLink && copyLink.value) return copyLink.value;

            var shortUrl = document.getElementById('short_url');
            if (shortUrl && shortUrl.value) return shortUrl.value;

            return '';
        }

        function wrapToggleShareFillBoxes() {
            if (typeof window.toggle_share_fill_boxes !== 'function' || window.toggle_share_fill_boxes.sbCopyWrapped) {
                return false;
            }

            var originalToggleShareFillBoxes = window.toggle_share_fill_boxes;
            window.toggle_share_fill_boxes = function (url, shorturl, title) {
                var result = originalToggleShareFillBoxes.apply(this, arguments);
                if (shareboxObs) {
                    delete shareboxObs.dataset.sbEnhanced;
                }
                doCopyShortUrl(shorturl);
                setTimeout(enhanceShareboxes, 320);
                return result;
            };
            window.toggle_share_fill_boxes.sbCopyWrapped = true;
            return true;
        }

        if (!wrapToggleShareFillBoxes()) {
            var wrapAttempts = 0;
            var wrapTimer = setInterval(function () {
                wrapAttempts++;
                if (wrapToggleShareFillBoxes() || wrapAttempts > 30) {
                    clearInterval(wrapTimer);
                }
            }, 100);
        }

        if (addBtn) {
            addBtn.addEventListener('click', function (event) {
                if (stopReservedKeywordAction(event)) return;
                // Snapshot the current short URL before AJAX runs
                var prevUrl = getCurrentShortUrlValue();
                var attempts = 0;
                var poll = setInterval(function () {
                    attempts++;
                    var newUrl = getCurrentShortUrlValue();
                    // Wait until the short URL is populated AND different from what was there before
                    if (newUrl && newUrl !== prevUrl) {
                        clearInterval(poll);
                        if (shareboxObs) {
                            delete shareboxObs.dataset.sbEnhanced;
                        }
                        doCopyShortUrl(newUrl);
                        enhanceShareboxes();
                    } else if (attempts > 60) { // give up after 6s
                        clearInterval(poll);
                    }
                }, 100);
            });
        }

        // 6d. Keyword suggestion — mirrors the PHP suggest-keyword endpoint logic.
        (function () {
            var urlInput = document.getElementById('add-url');
            var kwInput  = document.getElementById('add-keyword');
            if (!urlInput || !kwInput) return;

            var KU_IGNORE = [
                'doc','docs','file','files','download','downloads','uploads','upload','pdf','view','index','home',
                'page','post','posts','article','articles','content','node','item','items','detail','details',
                'news','blog','blogs',
                'category','categories','tag','tags','search','share','redirect','go','out','link','links',
                'www','http','https','html','htm','php','aspx','kuscc'
            ];
            var QUERY_HINTS = ['title','name','topic','q','query','search','keyword','keywords','s','text','headline','slug'];

            function isReadable(kw) {
                if (kw.length < 4) return false;
                if (/\d{3,}/.test(kw)) return false;
                if (/[0-9]/.test(kw) && kw.length >= 8) return false;
                if (/^[a-f0-9]{12,}$/.test(kw)) return false;
                if (kw.length >= 10 && !/[aeiou]/.test(kw)) return false;
                return true;
            }

            function stableHash(value) {
                var hash = 0;
                for (var i = 0; i < value.length; i++) {
                    hash = ((hash << 5) - hash) + value.charCodeAt(i);
                    hash |= 0;
                }
                return Math.abs(hash).toString(36).substring(0, 4);
            }

            function cleanCandidate(value) {
                if (!value) return '';
                try { value = decodeURIComponent(value.replace(/\+/g, ' ')); } catch (e) {}
                value = value
                    .normalize ? value.normalize('NFKD') : value;
                value = value
                    .toLowerCase()
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\.[a-z0-9]+$/i, '')
                    .replace(/&[a-z]+;/g, ' ')
                    .replace(/[^a-z0-9]+/g, ' ')
                    .trim();

                var words = value.split(/\s+/).filter(function (word) {
                    return word.length > 2 && KU_IGNORE.indexOf(word) === -1 && !/^\d+$/.test(word);
                });

                return words.slice(0, 4).join('');
            }

            function addCandidate(candidates, value, score) {
                var kw = cleanCandidate(value);
                if (!kw) return;
                candidates.push({ keyword: kw, score: score });
            }

            function parseUrl(value) {
                try {
                    return new URL(value);
                } catch (e) {
                    return new URL('https://' + value.replace(/^\/+/, ''));
                }
            }

            function extractCandidates(url) {
                var candidates = [];
                try {
                    var parsed = parseUrl(url);
                    var path = parsed.pathname;
                    var segments = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
                    for (var i = segments.length - 1; i >= 0; i--) {
                        addCandidate(candidates, segments[i], 90 + i);
                    }

                    QUERY_HINTS.forEach(function (key) {
                        var value = parsed.searchParams.get(key);
                        if (value) addCandidate(candidates, value, 85);
                    });

                    parsed.searchParams.forEach(function (value, key) {
                        if (QUERY_HINTS.indexOf(key.toLowerCase()) === -1) {
                            addCandidate(candidates, value, 55);
                        }
                    });

                    if (parsed.hash) addCandidate(candidates, parsed.hash.replace(/^#/, ''), 45);
                    addCandidate(candidates, parsed.hostname.replace(/^www\./, '').split('.')[0], 30);
                } catch (e) {}
                return candidates;
            }

            function suggestKeyword(url) {
                url = url.trim();
                if (!url) return '';
                var candidates = extractCandidates(url).filter(function (candidate) {
                    return isReadable(candidate.keyword);
                });
                candidates.sort(function (a, b) {
                    if (b.score !== a.score) return b.score - a.score;
                    return b.keyword.length - a.keyword.length;
                });

                if (candidates.length) {
                    return candidates[0].keyword.substring(0, 20);
                }

                var fallback = '';
                try {
                    fallback = cleanCandidate(parseUrl(url).hostname.replace(/^www\./, '').split('.')[0]);
                } catch (e) {}
                if (!fallback) fallback = 'link';
                return (fallback.substring(0, 14) + stableHash(url)).substring(0, 20);
            }

            function applySuggestion(force) {
                var url = urlInput.value.trim();
                if (!url) return;
                if (!force && kwInput.value.trim()) return; // don't overwrite manual input
                var kw = suggestKeyword(url);
                if (kw) {
                    kwInput.value = kw;
                    kwInput.classList.add('sb-kw-suggested');
                    setTimeout(function () { kwInput.classList.remove('sb-kw-suggested'); }, 1200);
                }
            }

            // Auto-suggest on URL blur if keyword is empty
            urlInput.addEventListener('blur', function () { applySuggestion(false); });

            // Clear the "suggested" state if the user edits manually
            kwInput.addEventListener('input', function () { kwInput.classList.remove('sb-kw-suggested'); });

            // Inject the pulse style for the keyword field highlight
            var s = document.createElement('style');
            s.textContent = [
                '#add-keyword.sb-kw-suggested {',
                '  border-color: var(--sb-accent,#1e87f0) !important;',
                '  box-shadow: 0 0 0 3px rgba(30,135,240,.15) !important;',
                '  transition: border-color .2s, box-shadow .2s;',
                '}',
            ].join('\n');
            document.head.appendChild(s);
        }());

        // 7. Wrap the page h2 + optional description paragraph in uk-container.
        var mainEl = document.querySelector('#wrap > main, body > main');
        if (mainEl) {
            var children = mainEl.children;
            var pageH2 = null;
            for (var i = 0; i < children.length; i++) {
                if (children[i].tagName === 'H2') { pageH2 = children[i]; break; }
            }
            if (pageH2) {
                var wrap = document.createElement('div');
                wrap.className = 'uk-container sb-page-header';
                pageH2.parentNode.insertBefore(wrap, pageH2);
                wrap.appendChild(pageH2);
                var next = wrap.nextElementSibling;
                if (next && next.tagName === 'P') { wrap.appendChild(next); }
            }
        }

    });
})();
