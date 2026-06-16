/* ============================================================
   YOURLS UIkit Skin — runtime tweaks
   ============================================================ */

(function () {
    'use strict';

    var ICON_COPY = 'content_copy';
    var ICON_CHECK = 'check';
    var ICON_EDIT = 'edit';
    var ICON_DELETE = 'delete';
    var ICON_QR = 'qr_code_2';
    var ICON_SHARE = 'share';

    function sbIconHtml(name, className, size) {
        var sizeStyle = size ? ' style="font-size:' + parseInt(size, 10) + 'px"' : '';
        return '<span class="material-symbols-outlined sb-icon' + (className ? ' ' + className : '') + '" aria-hidden="true"' + sizeStyle + '>' + name + '</span>';
    }

    function sbIconEl(name, className, size) {
        var span = document.createElement('span');
        span.className = 'material-symbols-outlined sb-icon' + (className ? ' ' + className : '');
        span.setAttribute('aria-hidden', 'true');
        if (size) span.style.fontSize = parseInt(size, 10) + 'px';
        span.textContent = name;
        return span;
    }

    function sbInputButtonVariant(input) {
        if (!input) return 'secondary';
        var onclick = input.getAttribute('onclick') || '';
        if (onclick.indexOf('remove_link_confirmed') !== -1 || /delete/i.test(input.value || '')) return 'danger';
        if (input.id === 'add-button' || input.id === 'submit-sort') return 'primary';
        if (input.classList.contains('primary')) return 'primary';
        if (input.type === 'reset') return 'secondary';
        return 'secondary';
    }

    function sbIsUrlPrefixOnly(value) {
        value = (value || '').trim().toLowerCase();
        return value === 'http://' || value === 'https://';
    }

    function sbSetupUrlInputPlaceholder(input, placeholder) {
        if (!input || input.dataset.sbUrlPlaceholder) return input;
        input.dataset.sbUrlPlaceholder = '1';

        if (!(input.value || '').trim() || sbIsUrlPrefixOnly(input.value)) {
            input.value = '';
        }

        input.placeholder = placeholder || 'https://';
        return input;
    }

    function sbEnhanceInputButton(input, iconName, label, wrapClass) {
        if (!input || input.dataset.sbIconDone) return input;
        input.dataset.sbIconDone = '1';

        if (label) input.value = label;

        var wrapper = document.createElement('span');
        wrapper.className = 'sb-input-btn-wrap sb-input-btn-wrap--' + sbInputButtonVariant(input);
        if (wrapClass) wrapper.className += ' ' + wrapClass;

        var parent = input.parentNode;
        parent.insertBefore(wrapper, input);
        wrapper.appendChild(sbIconEl(iconName, 'sb-btn-icon', 18));
        wrapper.appendChild(input);

        input.classList.add('sb-btn-has-icon');
        return input;
    }

    function sbEnhanceDialogButtons(root) {
        var scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll('#delete-confirm-dialog .button-group input[type="button"].primary, .ui-dialog .button-group input.button.primary').forEach(function (btn) {
            sbEnhanceInputButton(btn, ICON_DELETE, btn.value || 'Delete');
        });
        scope.querySelectorAll('#delete-confirm-dialog .button-group input[type="reset"], .ui-dialog .button-group input[type="reset"]').forEach(function (btn) {
            sbEnhanceInputButton(btn, 'close', btn.value || 'Cancel');
        });
    }

    function sbResetDeleteDialogLayout(dialog) {
        dialog = dialog || document.getElementById('delete-confirm-dialog');
        if (!dialog) return;
        if (!dialog.open) {
            dialog.style.removeProperty('display');
            dialog.style.removeProperty('flex-direction');
            return;
        }
        dialog.style.setProperty('display', 'flex', 'important');
        dialog.style.setProperty('flex-direction', 'column', 'important');
        dialog.style.setProperty('height', 'fit-content', 'important');
        dialog.style.setProperty('min-height', '0', 'important');
        dialog.style.setProperty('width', 'min(480px, calc(100vw - 40px))', 'important');
        dialog.style.setProperty('max-height', 'calc(100vh - 40px)', 'important');
        dialog.querySelectorAll('.confirm-message, .button-group').forEach(function (el) {
            el.style.setProperty('height', 'auto', 'important');
            el.style.setProperty('min-height', '0', 'important');
            el.style.setProperty('width', '100%', 'important');
            el.style.setProperty('max-width', 'none', 'important');
        });
    }

    function sbWatchDeleteDialogLayout() {
        var dialog = document.getElementById('delete-confirm-dialog');
        if (!dialog || dialog.dataset.sbLayoutWatch) return;
        dialog.dataset.sbLayoutWatch = '1';
        dialog.addEventListener('close', function () {
            sbResetDeleteDialogLayout(dialog);
        });
        new MutationObserver(function () {
            if (!dialog.open) {
                sbResetDeleteDialogLayout(dialog);
                return;
            }
            sbResetDeleteDialogLayout(dialog);
            sbEnhanceDialogButtons(dialog);
        }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    }

    function sbApplyFieldClass(root) {
        var scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll('input.text, input[type="text"], input[type="url"], input[type="search"], input[type="password"], select').forEach(function (el) {
            var type = (el.type || '').toLowerCase();
            if (type === 'button' || type === 'submit' || type === 'reset' || type === 'hidden' || type === 'checkbox' || type === 'radio' || type === 'color' || type === 'file') return;
            if (el.classList.contains('sb-colour-picker') || el.classList.contains('sb-btn-has-icon')) return;
            if (el.closest('#filter_buttons')) return;
            el.classList.add('sb-field');
        });
    }

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
        el.className = 'sb-qr-modal';
        el.innerHTML = [
            '<div class="sb-qr-dialog">',
            '  <button id="sb-qr-close" type="button" class="sb-qr-close" title="Close" aria-label="Close">' + sbIconHtml('close', '', 22) + '</button>',
            '  <p class="sb-qr-kw"></p>',
            '  <img id="sb-qr-img" class="sb-qr-img" src="" alt="QR Code" />',
            '  <p class="sb-qr-url"></p>',
            '  <a id="sb-qr-download" class="sb-qr-download" href="#" download>' + sbIconHtml('download', '', 18) + ' Download</a>',
            '</div>'
        ].join('');
        document.body.appendChild(el);

        // Close on backdrop click
        el.addEventListener('click', function (e) {
            if (e.target === el) sbHideQrModal();
        });
        // Close button
        el.querySelector('#sb-qr-close').addEventListener('click', sbHideQrModal);
        el.querySelector('#sb-qr-download').addEventListener('click', function (e) {
            e.preventDefault();
            sbDownloadQrPng();
        });
        // Close on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') sbHideQrModal();
        });

        _qrModal = el;
        return el;
    }

    function sbTriggerFileDownload(blob, filename) {
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    }

    function sbGetQrImageUrl(shortUrl, size) {
        var qrSize = size || 280;
        return 'https://api.qrserver.com/v1/create-qr-code/?size=' + qrSize + 'x' + qrSize + '&margin=10&data=' + encodeURIComponent(shortUrl);
    }

    function sbExtractKeyword(shortUrl) {
        try {
            var parsed = new URL(shortUrl);
            var parts = parsed.pathname.replace(/\/$/, '').split('/').filter(Boolean);
            return parts.length ? parts[parts.length - 1] : 'qr';
        } catch (e) {
            return 'qr';
        }
    }

    function sbDownloadQrImage(img, keyword, apiUrl) {
        var filename = (keyword || 'qr') + '-qr.png';

        function downloadFromCanvas() {
            if (!img || !img.complete || !img.naturalWidth) return false;
            try {
                var canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob(function (blob) {
                    sbTriggerFileDownload(blob, filename);
                }, 'image/png');
                return true;
            } catch (err) {
                return false;
            }
        }

        if (downloadFromCanvas()) return;

        if (!apiUrl) return;
        fetch(apiUrl, { mode: 'cors' })
            .then(function (res) {
                if (!res.ok) throw new Error('fetch failed');
                return res.blob();
            })
            .then(function (blob) {
                sbTriggerFileDownload(blob, filename);
            })
            .catch(function () {
                if (!downloadFromCanvas()) {
                    window.open(apiUrl, '_blank', 'noopener');
                }
            });
    }

    function sbDownloadQrPng() {
        var modal = _qrModal;
        if (!modal) return;

        var img = modal.querySelector('#sb-qr-img');
        var apiUrl = modal.dataset.qrImageUrl || (img ? img.src : '');
        sbDownloadQrImage(img, modal.dataset.qrKeyword || 'qr', apiUrl);
    }

    function sbShowQrModal(keyword, shortUrl) {
        var modal = sbGetQrModal();
        var apiUrl = sbGetQrImageUrl(shortUrl, 280);
        var img = modal.querySelector('#sb-qr-img');
        modal.dataset.qrKeyword = keyword;
        modal.dataset.qrImageUrl = apiUrl;
        modal.querySelector('.sb-qr-kw').textContent = keyword;
        modal.querySelector('.sb-qr-url').textContent = shortUrl;
        if (img) {
            img.crossOrigin = 'anonymous';
            img.src = apiUrl;
        }
        modal.classList.add('sb-qr-modal-open');
        document.body.style.overflow = 'hidden';
    }

    function sbHideQrModal() {
        if (_qrModal) _qrModal.classList.remove('sb-qr-modal-open');
        document.body.style.overflow = '';
    }
    // ─────────────────────────────────────────────────────────────────

    ready(function () {
        sbApplyFieldClass(document);

        var footer = document.getElementById('footer');
        if (footer && !footer.classList.contains('sb-login-footer')) {
            var footerText = footer.textContent || '';
            var footerVersion = footerText.match(/v\s*([\d.]+)/i);
            footer.textContent = 'Powered by YOURLS' + (footerVersion ? ' v ' + footerVersion[1] : '');
        }

        var pluginsTable = document.querySelector('#main_table tr.plugin, #main_table td.plugin_name, table#plugins_table');
        var isPluginsPage = /\/plugins\.php$/.test(window.location.pathname) && !window.location.search.match(/[?&]page=/);
        if (pluginsTable || isPluginsPage) {
            document.body.classList.add('sb-plugins-page');
            if (window._sbCanManageSettings === false) {
                document.body.classList.add('sb-plugins-readonly');
                document.querySelectorAll('#main_table td.plugin_actions a, #main_table td.actions a').forEach(function (link) {
                    link.setAttribute('aria-disabled', 'true');
                    link.setAttribute('tabindex', '-1');
                    link.addEventListener('click', function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    });
                });
            }
        }
        if (/\/tools\.php$/.test(window.location.pathname)) {
            document.body.classList.add('sb-tools-page');
        }
        if (/\/plugins\.php$/.test(window.location.pathname) && /[?&]page=uikit_skin_settings(?:&|$)/.test(window.location.search)) {
            document.body.classList.add('sb-settings-admin-page');
        }
        if (/\/plugins\.php$/.test(window.location.pathname) && /[?&]page=uikit_skin_dashboard(?:&|$)/.test(window.location.search)) {
            document.body.classList.add('sb-dashboard-admin-page');
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
                btn.innerHTML = sbIconHtml(ICON_COPY, 'sb-copy-icon', 18);
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
                    btn.innerHTML = sbIconHtml(ICON_CHECK, 'sb-copy-icon', 18);
                    setTimeout(function () {
                        delete btn.dataset.copied;
                        btn.classList.remove('sb-copy-copied');
                        btn.innerHTML = sbIconHtml(ICON_COPY, 'sb-copy-icon', 18);
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
        var BASE_BTN_STYLE = 'display:inline-flex!important;align-items:center;justify-content:center;width:28px;height:28px;border-radius:5px;border:none;background:transparent;color:#6b7280;padding:0;margin:1px;text-decoration:none;vertical-align:middle;box-sizing:border-box;';

        // Clean up "Optional : Custom short URL" label → "Custom short URL"
        var kwLabel = document.querySelector('label[for="add-keyword"]');
        if (kwLabel) {
            kwLabel.innerHTML = '<strong>Custom short URL</strong>';
        }

        // Rename "Shorten The URL" button → "Shorten" + icon (after title row exists)
        var addBtn = document.getElementById('add-button');

        function sbSetupAdminTitleField() {
            if (document.getElementById('add-title')) {
                return document.querySelector('.sb-new-url-title-row');
            }

            var titleRow = document.createElement('div');
            titleRow.className = 'sb-new-url-title-row sb-new-url-field sb-new-url-field--title';

            var titleLabel = document.createElement('label');
            titleLabel.setAttribute('for', 'add-title');
            titleLabel.innerHTML = '<strong>Title (optional)</strong>';

            var titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.id = 'add-title';
            titleInput.name = 'title';
            titleInput.className = 'text';
            titleInput.setAttribute('autocomplete', 'off');

            titleRow.appendChild(titleLabel);
            titleRow.appendChild(titleInput);
            return titleRow;
        }

        function sbLayoutAdminUrlForm(grid) {
            if (!grid || grid.dataset.sbUrlLayoutDone) return;

            var urlLabel = grid.querySelector('label[for="add-url"]');
            var urlInput = document.getElementById('add-url');
            var kwLabel = grid.querySelector('label[for="add-keyword"]');
            var kwInput = document.getElementById('add-keyword');
            var nonce = document.getElementById('nonce-add');
            var submitWrap = grid.querySelector('.sb-input-btn-wrap--add');
            var titleRow = grid.querySelector('.sb-new-url-title-row') || sbSetupAdminTitleField();

            if (!urlLabel || !urlInput || !kwLabel || !kwInput || !titleRow) return;

            var mainRow = document.createElement('div');
            mainRow.className = 'sb-new-url-row sb-new-url-row--main';

            var urlField = document.createElement('div');
            urlField.className = 'sb-new-url-field sb-new-url-field--url';

            var kwField = document.createElement('div');
            kwField.className = 'sb-new-url-field sb-new-url-field--kw';

            var submitCell = document.createElement('div');
            submitCell.className = 'sb-new-url-submit';

            urlField.appendChild(urlLabel);
            urlField.appendChild(urlInput);
            kwField.appendChild(kwLabel);
            kwField.appendChild(kwInput);
            mainRow.appendChild(urlField);
            mainRow.appendChild(kwField);
            mainRow.appendChild(titleRow);
            if (submitWrap) submitCell.appendChild(submitWrap);
            mainRow.appendChild(submitCell);

            grid.textContent = '';
            grid.appendChild(mainRow);
            if (nonce) grid.appendChild(nonce);

            grid.dataset.sbUrlLayoutDone = '1';
        }

        // Normalize the add URL form so CSS grid can make it responsive.
        var newUrlWrap = document.getElementById('new_url');
        var newUrlForm = document.getElementById('new_url_form');
        if (newUrlWrap) {
            var newUrlShell = newUrlWrap.querySelector(':scope > div');
            if (newUrlShell) newUrlShell.classList.add('sb-new-url-shell');
        }
        var newUrlGrid = null;
        if (newUrlForm) {
            newUrlGrid = newUrlForm.querySelector('div');
            if (newUrlGrid) {
                newUrlGrid.classList.add('sb-new-url-grid');
                Array.prototype.slice.call(newUrlGrid.childNodes).forEach(function (node) {
                    if (node.nodeType === 3 && node.textContent.trim() === ':') {
                        newUrlGrid.removeChild(node);
                    }
                });
            }
        }
        if (addBtn) sbEnhanceInputButton(addBtn, 'link', 'Shorten', 'sb-input-btn-wrap--add');
        sbLayoutAdminUrlForm(newUrlGrid);
        var urlLabel = document.querySelector('label[for="add-url"]');
        if (urlLabel) {
            urlLabel.innerHTML = '<strong>Enter URL</strong>';
        }

        // Let CSS control responsive input widths.
        var urlInput = document.getElementById('add-url');
        if (urlInput) {
            urlInput.removeAttribute('size');
            sbSetupUrlInputPlaceholder(urlInput, 'https://');
        }
        var kwInput = document.getElementById('add-keyword');
        if (kwInput) kwInput.removeAttribute('size');
        var KEYWORD_MAX_LENGTH = 20;
        var keywordLengthMessage = 'Custom short URL must be ' + KEYWORD_MAX_LENGTH + ' characters or fewer.';
        var RESERVED_KEYWORDS = ['kuscc'];

        function isReservedKeyword(value) {
            value = (value || '').trim().toLowerCase();
            return RESERVED_KEYWORDS.some(function (keyword) {
                return value.indexOf(keyword) !== -1;
            });
        }

        function getKeywordValidationMessage(value) {
            value = (value || '').trim();
            if (isReservedKeyword(value)) return reservedMessage;
            if (value.length > KEYWORD_MAX_LENGTH) return keywordLengthMessage;
            return '';
        }

        function refreshKeywordValidation(input) {
            if (!input) return false;
            var message = getKeywordValidationMessage(input.value);
            input.setCustomValidity(message);
            if (message) {
                input.classList.add('sb-input-error');
            } else {
                input.classList.remove('sb-input-error');
            }
            return !!message;
        }

        function sbSetupKeywordFieldRules(input, form) {
            if (!input || input.dataset.sbKwRulesDone) return;
            input.dataset.sbKwRulesDone = '1';
            input.setAttribute('maxlength', String(KEYWORD_MAX_LENGTH));

            input.addEventListener('input', function () {
                refreshKeywordValidation(input);
            });

            if (form) {
                form.addEventListener('submit', function (event) {
                    if (!refreshKeywordValidation(input)) return;
                    event.preventDefault();
                    showKeywordValidationMessage(input);
                }, true);
            }

            refreshKeywordValidation(input);
        }

        var reservedMessage = 'Custom short URLs cannot contain "kuscc" because it duplicates the hosting name.';

        function showKeywordValidationMessage(input) {
            input = input || kwInput;
            var message = input ? getKeywordValidationMessage(input.value) : reservedMessage;
            if (!message) return;

            if (typeof window.feedback === 'function') {
                window.feedback(message, 'fail', 10000);
            } else if (typeof showToast === 'function') {
                showToast(message, 'fail');
            }

            if (!input) return;
            input.classList.add('sb-input-error');
            input.focus();
        }

        function showReservedKeywordMessage() {
            showKeywordValidationMessage(kwInput);
        }

        function clearReservedKeywordMessage() {
            if (kwInput) kwInput.classList.remove('sb-input-error');
        }

        function refreshReservedKeywordState() {
            return refreshKeywordValidation(kwInput);
        }

        function stopReservedKeywordAction(event, showMessage) {
            if (!refreshReservedKeywordState()) return false;
            if (showMessage !== false) showReservedKeywordMessage();
            if (event) {
                event.preventDefault();
                event.stopPropagation();
                if (event.stopImmediatePropagation) event.stopImmediatePropagation();
            }
            return true;
        }

        if (kwInput) {
            sbSetupKeywordFieldRules(kwInput, newUrlForm);
        }

        if (addBtn && kwInput) {
            addBtn.addEventListener('click', stopReservedKeywordAction, true);
        }

        function wrapAddLinkForReservedKeywords() {
            if (typeof window.add_link !== 'function' || window.add_link.sbReservedWrapped) {
                return typeof window.add_link === 'function';
            }
            if (typeof window.jQuery === 'undefined') return false;

            var $ = window.jQuery;
            var originalAddLink = window.add_link;
            window.add_link = function () {
                if (stopReservedKeywordAction(null, true)) return false;
                if ($('#add-button').hasClass('disabled')) return false;

                var newurl = $('#add-url').val();
                var nonce = $('#nonce-add').val();
                if (!newurl || newurl === 'http://' || newurl === 'https://') return;

                var keyword = $('#add-keyword').val();
                var titleInput = document.getElementById('add-title');
                var title = titleInput ? titleInput.value.trim() : '';
                var nextid = parseInt($('#main_table tbody tr[id^="id-"]').length, 10) + 1;

                add_loading('#add-button');
                $.getJSON(
                    ajaxurl,
                    { action: 'add', url: newurl, keyword: keyword, title: title, nonce: nonce, rowid: nextid },
                    function (data) {
                        if (data.status === 'success') {
                            $('#main_table tbody').prepend(data.html).trigger('update');
                            $('#nourl_found').css('display', 'none');
                            zebra_table();
                            increment_counter();
                            toggle_share_fill_boxes(data.url.url, data.shorturl, data.url.title);
                        }

                        add_link_reset();
                        end_loading('#add-button');
                        end_disable('#add-button');
                        feedback(data.message, data.status);
                    }
                );
                return false;
            };
            window.add_link.sbReservedWrapped = true;

            if (typeof window.add_link_reset === 'function' && !window.add_link_reset.sbReservedWrapped) {
                var originalReset = window.add_link_reset;
                window.add_link_reset = function () {
                    originalReset();
                    var titleField = document.getElementById('add-title');
                    if (titleField) {
                        titleField.value = '';
                        titleField.classList.remove('sb-title-suggested');
                    }
                    if (typeof window.sbAdminTitleResetTouched === 'function') {
                        window.sbAdminTitleResetTouched();
                    }
                };
                window.add_link_reset.sbReservedWrapped = true;
            }

            return true;
        }

        if (!wrapAddLinkForReservedKeywords()) {
            var addLinkWrapAttempts = 0;
            var addLinkWrapTimer = setInterval(function () {
                addLinkWrapAttempts++;
                if (wrapAddLinkForReservedKeywords() || addLinkWrapAttempts > 30) {
                    clearInterval(addLinkWrapTimer);
                }
            }, 100);
        }

        function getActionType(link) {
            if (!link) return '';
            var cls = ' ' + String(link.className || '').toLowerCase().replace(/\s+/g, ' ') + ' ';
            if (cls.indexOf(' button_stats ') !== -1 || cls.indexOf(' button-stat ') !== -1) return 'stats';
            if (cls.indexOf(' button_edit ') !== -1 || cls.indexOf(' button-edit ') !== -1) return 'edit';
            if (cls.indexOf(' button_delete ') !== -1 || cls.indexOf(' button-delete ') !== -1) return 'delete';
            if (cls.indexOf(' button_share ') !== -1 || cls.indexOf(' button-share ') !== -1) return 'share';
            if (cls.indexOf(' sb-qr-btn ') !== -1) return 'qr';
            var title = (link.getAttribute('title') || '').toLowerCase();
            if (title === 'edit') return 'edit';
            if (title === 'delete') return 'delete';
            if (title === 'share') return 'share';
            if (title === 'stats') return 'stats';
            return '';
        }

        function hideActionLink(link) {
            link.classList.add('sb-action-hidden');
            link.setAttribute('aria-hidden', 'true');
            link.style.display = 'none';
        }

        function setActionIcon(link, iconName) {
            link.innerHTML = sbIconHtml(iconName, 'sb-action-icon', 18);
            link.classList.add('sb-action-btn');
            link.style.cssText = BASE_BTN_STYLE;
            link.style.textIndent = '0';
            link.style.backgroundImage = 'none';
            link.style.backgroundColor = 'transparent';
            link.style.opacity = '1';
            link.style.visibility = 'visible';
            link.style.pointerEvents = 'auto';
            var icon = link.querySelector('.sb-icon');
            if (icon) {
                icon.style.pointerEvents = 'none';
                icon.style.fontFamily = '"Material Symbols Outlined"';
            }
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
                    setActionIcon(link, ICON_CHECK);
                    link.classList.add('sb-copy-copied');
                    showToast('Copied share text');
                    setTimeout(function () {
                        link.classList.remove('sb-copy-copied');
                        setActionIcon(link, ICON_SHARE);
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

                var keywordLink = tr.querySelector('td.keyword a');
                if (!keywordLink) return;

                var shortUrl = keywordLink.href.replace(/\/$/, '');
                var keyword  = keywordLink.textContent.trim();
                var ordered = { qr: null, edit: null, share: null, delete: null };

                actionsTd.querySelectorAll('a').forEach(function (a) {
                    var type = getActionType(a);
                    if (type === 'stats') {
                        hideActionLink(a);
                        return;
                    }
                    if (type === 'edit') {
                        setActionIcon(a, ICON_EDIT);
                        ordered.edit = a;
                    } else if (type === 'delete') {
                        setActionIcon(a, ICON_DELETE);
                        ordered.delete = a;
                    } else if (type === 'share') {
                        setActionIcon(a, ICON_SHARE);
                        attachShareCopyHandler(a, tr);
                        ordered.share = a;
                    }
                });

                if (!ordered.qr) {
                    var qrBtn = document.createElement('a');
                    qrBtn.href = '#';
                    qrBtn.className = 'sb-qr-btn';
                    qrBtn.title = 'QR Code';
                    setActionIcon(qrBtn, ICON_QR);
                    qrBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        sbShowQrModal(keyword, shortUrl);
                    });
                    ordered.qr = qrBtn;
                }

                [ordered.qr, ordered.edit, ordered.share, ordered.delete].forEach(function (node) {
                    if (node) actionsTd.appendChild(node);
                });
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
                    var actionsCell = tr.querySelector('td.actions');
                    if (actionsCell && actionsCell.parentNode === tr) {
                        tr.insertBefore(td, actionsCell);
                    } else {
                        tr.appendChild(td);
                    }
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

            // Add USER before ACTIONS so Actions stays the last column.
            var headerRow = table.querySelector('thead tr');
            if (headerRow) {
                var th = document.createElement('th');
                th.textContent = 'User';
                th.className = 'sb-col-user';
                var actionsTh = headerRow.querySelector('th.actions');
                if (actionsTh && actionsTh.parentNode === headerRow) {
                    headerRow.insertBefore(th, actionsTh);
                } else {
                    headerRow.appendChild(th);
                }
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

        // 3. Add a body class on the login page so the CSS can re-style it.
        if (document.body && document.querySelector('form#login')) {
            document.body.classList.add('login');
            var loginError = document.getElementById('error-message');
            if (loginError && loginError.textContent.trim()) {
                loginError.style.display = 'block';
            }
            var loginLogo = document.getElementById('yourls-logo');
            var loginTitleLink = document.querySelector('h1 a');
            var loginTitle = document.querySelector('header h1, h1');
            var loginHeader = document.querySelector('header[role="banner"], header');
            var loginTitleText = loginTitleLink ? loginTitleLink.textContent.replace(/\s+/g, ' ').trim().replace(/^YOURLS:\s*/i, '') : '';
            if (loginLogo) {
                loginLogo.style.display = 'none';
                if (!document.querySelector('.sb-login-brand-icon')) {
                    var brandIcon = document.createElement('div');
                    brandIcon.className = 'sb-login-brand-icon';
                    brandIcon.innerHTML = sbIconHtml('link', 'sb-login-brand-symbol', 44);
                    if (loginHeader) {
                        loginHeader.insertBefore(brandIcon, loginHeader.firstChild);
                    } else if (loginLogo.parentNode) {
                        loginLogo.parentNode.insertBefore(brandIcon, loginLogo);
                    }
                }
            }
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

            var loginFooter = document.getElementById('footer');
            if (!loginFooter) {
                loginFooter = document.createElement('footer');
                loginFooter.id = 'footer';
                loginFooter.setAttribute('role', 'contentinfo');
            }
            loginFooter.classList.add('sb-login-footer');
            var yourlsVersion = window._yourlsVersion || '';
            if (!yourlsVersion) {
                var generatorMeta = document.querySelector('meta[name="generator"]');
                var generatorMatch = generatorMeta
                    ? (generatorMeta.getAttribute('content') || '').match(/YOURLS\s+([\d.]+)/i)
                    : null;
                yourlsVersion = generatorMatch ? generatorMatch[1] : '';
            }
            loginFooter.textContent = 'Powered by YOURLS' + (yourlsVersion ? ' v ' + yourlsVersion : '');
            if (!loginFooter.parentNode) {
                document.body.appendChild(loginFooter);
            }

        }

        function sbSetupTitleSuggestion(urlInput, titleInput, getNonce) {
            if (!urlInput || !titleInput || typeof window.jQuery === 'undefined' || !window.ajaxurl) return null;

            var $ = window.jQuery;
            var titleTouched = false;
            var titleTimer = null;
            var titleRequest = null;

            function resolveNonce() {
                if (typeof getNonce === 'function') {
                    return getNonce();
                }
                return getNonce || '';
            }

            function applyTitleSuggestion(force) {
                if (!force && titleTouched) return;

                var url = urlInput.value.trim();
                if (!url || url === 'http://' || url === 'https://') return;

                var nonce = resolveNonce();
                if (!nonce) return;

                if (titleRequest && titleRequest.readyState !== 4) {
                    titleRequest.abort();
                }

                titleRequest = $.getJSON(ajaxurl, {
                    action: 'fetch_title',
                    url: url,
                    nonce: nonce
                }, function (data) {
                    titleRequest = null;
                    if (!data || data.status !== 'success' || !data.title) return;
                    if (!force && titleTouched) return;
                    titleInput.value = data.title;
                    titleInput.classList.add('sb-title-suggested');
                    setTimeout(function () { titleInput.classList.remove('sb-title-suggested'); }, 1200);
                });
            }

            titleInput.addEventListener('input', function () {
                titleTouched = titleInput.value.trim().length > 0;
                titleInput.classList.remove('sb-title-suggested');
            });

            urlInput.addEventListener('input', function () {
                if (titleTimer) clearTimeout(titleTimer);
                titleTimer = setTimeout(function () { applyTitleSuggestion(false); }, 500);
            });
            urlInput.addEventListener('blur', function () { applyTitleSuggestion(false); });

            return {
                resetTouched: function () {
                    titleTouched = false;
                },
                suggest: applyTitleSuggestion
            };
        }

        function publicRestructureFieldRow(field, labelText, rowClass) {
            var row = field.closest('p, div');
            if (!row) return;
            row.classList.add(rowClass);
            var label = field.closest('label');
            if (!label || label.dataset.sbFieldDone) return;
            label.dataset.sbFieldDone = '1';
            label.classList.add('sb-public-field-label');

            var textEl = document.createElement('span');
            textEl.className = 'sb-public-label-text';
            textEl.textContent = labelText;

            while (label.firstChild) label.removeChild(label.firstChild);
            label.appendChild(textEl);
            label.appendChild(field);
        }

        function publicExtractKeywordPrefix(label, field) {
            var prefix = '';
            Array.prototype.slice.call(label.childNodes).forEach(function (node) {
                if (node === field) return;
                if (node.nodeType !== 3) return;
                var match = node.textContent.match(/(https?:\/\/\S+?\/)/i);
                if (match) prefix = match[1];
            });
            if (!prefix) {
                var text = label.textContent.replace(field.value, '').trim();
                var fallback = text.match(/(https?:\/\/\S+?\/)/i);
                if (fallback) prefix = fallback[1];
            }
            return prefix;
        }

        function publicRestructureKeywordRow(keywordField) {
            var keywordRow = keywordField.closest('p, div');
            if (!keywordRow) return;
            keywordRow.classList.add('sb-public-keyword-row');
            keywordField.removeAttribute('size');

            var label = keywordField.closest('label');
            if (!label || label.dataset.sbFieldDone) return;
            label.dataset.sbFieldDone = '1';
            label.classList.add('sb-public-field-label');

            var prefix = publicExtractKeywordPrefix(label, keywordField);
            var labelText = document.createElement('span');
            labelText.className = 'sb-public-label-text';
            labelText.textContent = 'Custom short URL (optional)';

            var group = document.createElement('span');
            group.className = 'sb-public-kw-group';

            if (prefix) {
                var prefixEl = document.createElement('span');
                prefixEl.className = 'sb-public-kw-prefix';
                prefixEl.textContent = prefix;
                prefixEl.setAttribute('title', prefix);
                group.appendChild(prefixEl);
            }

            while (label.firstChild) label.removeChild(label.firstChild);
            label.appendChild(labelText);
            label.appendChild(group);
            group.appendChild(keywordField);
        }

        function publicIsResultMessage(text) {
            text = (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
            return text.indexOf('added to database') !== -1
                || text.indexOf('already exists in database') !== -1
                || /\(short url:\s*[^)]+\)/i.test(text);
        }

        function publicDetectResultHeading() {
            var heading = null;
            document.querySelectorAll('h1, h2').forEach(function (el) {
                if (heading) return;
                if (publicIsResultMessage(el.textContent)) heading = el;
            });
            return heading;
        }

        function publicResultIsExisting(heading) {
            return /already exists in database/i.test((heading && heading.textContent) || '');
        }

        function publicParseResultUrl(heading, shortUrlInput, copyLinkInput) {
            var shortValue = '';
            if (shortUrlInput && shortUrlInput.value) shortValue = shortUrlInput.value.trim();
            else if (copyLinkInput && copyLinkInput.value) shortValue = copyLinkInput.value.trim();

            if (!shortValue && heading) {
                var headingLink = heading.querySelector('a[href]');
                if (headingLink && headingLink.href) shortValue = headingLink.href.trim();
                else {
                    var text = heading.textContent.replace(/\s+/g, ' ').trim();
                    var shortMatch = text.match(/\(short url:\s*([^)]+)\)/i);
                    if (shortMatch) shortValue = shortMatch[1].trim();
                    else shortValue = text.replace(/\s+added to database\.?$/i, '').trim();
                }
            }

            if (shortValue && !/^https?:\/\//i.test(shortValue)) {
                shortValue = 'https://' + shortValue.replace(/^\/+/, '');
            }

            return shortValue;
        }

        function publicHideShareboxes() {
            var shareboxes = document.getElementById('shareboxes');
            if (shareboxes) shareboxes.style.display = 'none';
        }

        function publicBuildResultShell(resultCard, options) {
            if (!resultCard || resultCard.closest('.sb-public-landing, .sb-public-result-landing')) return;

            options = options || {};
            var isExisting = !!options.existing;
            var parent = resultCard.parentNode;

            var shell = document.createElement('div');
            shell.className = 'sb-public-result-landing' + (isExisting ? ' sb-public-result-landing--existing' : '');
            shell.style.width = '100%';
            shell.style.maxWidth = 'none';
            shell.style.marginLeft = 'auto';
            shell.style.marginRight = 'auto';
            shell.style.display = 'flex';
            shell.style.flexDirection = 'column';
            shell.style.alignItems = 'center';

            var wrap = document.getElementById('wrap');
            if (wrap) {
                wrap.style.display = 'grid';
                wrap.style.justifyItems = 'center';
                wrap.style.width = '100%';
                wrap.style.maxWidth = 'none';
                wrap.style.margin = '0';
                wrap.style.padding = '0';
            }

            resultCard.style.width = 'min(720px, calc(100vw - 48px))';
            resultCard.style.maxWidth = '720px';
            resultCard.style.marginLeft = 'auto';
            resultCard.style.marginRight = 'auto';
            resultCard.style.boxSizing = 'border-box';

            var hero = document.createElement('div');
            hero.className = 'sb-public-hero sb-public-result-hero';
            hero.innerHTML = isExisting ? [
                '<h2 class="sb-public-title">Already shortened</h2>',
                '<p class="sb-public-subtitle">This long URL is already in the database. Use the existing short link below.</p>'
            ].join('') : [
                '<h2 class="sb-public-title">Link shortened</h2>',
                '<p class="sb-public-subtitle">Your short URL is ready to copy or open.</p>'
            ].join('');

            parent.insertBefore(shell, resultCard);
            shell.appendChild(hero);
            shell.appendChild(resultCard);
        }

        function publicBuildResultQr(shortUrl) {
            var keyword = sbExtractKeyword(shortUrl);
            var apiUrl = sbGetQrImageUrl(shortUrl, 220);
            var qrWrap = document.createElement('div');
            qrWrap.className = 'sb-public-result-qr';

            var qrLabel = document.createElement('p');
            qrLabel.className = 'sb-public-result-qr-label';
            qrLabel.textContent = 'QR code';

            var qrFrame = document.createElement('div');
            qrFrame.className = 'sb-public-result-qr-frame';

            var img = document.createElement('img');
            img.className = 'sb-public-result-qr-img';
            img.alt = 'QR code for ' + shortUrl;
            img.width = 220;
            img.height = 220;
            img.crossOrigin = 'anonymous';
            img.src = apiUrl;

            var downloadBtn = document.createElement('button');
            downloadBtn.type = 'button';
            downloadBtn.className = 'sb-public-result-qr-download';
            downloadBtn.innerHTML = sbIconHtml('download', 'sb-public-result-btn-icon', 18) + '<span>Download QR</span>';
            downloadBtn.addEventListener('click', function () {
                sbDownloadQrImage(img, keyword, apiUrl);
            });

            qrFrame.appendChild(img);
            qrWrap.appendChild(qrLabel);
            qrWrap.appendChild(qrFrame);
            qrWrap.appendChild(downloadBtn);
            return qrWrap;
        }

        function publicBuildHeader() {
            if (document.querySelector('.sb-public-header')) return;

            var header = document.createElement('header');
            header.className = 'sb-public-header';
            header.innerHTML = [
                '<div class="sb-public-header-inner">',
                '  <a class="sb-public-brand" href="' + window.location.pathname + '">',
                '    <span class="sb-public-brand-icon" aria-hidden="true">' + sbIconHtml('link', 'sb-public-brand-symbol', 28) + '</span>',
                '    <span class="sb-public-brand-copy">',
                '      <strong>LINK-KUSCC</strong>',
                '      <span>URL Shortener</span>',
                '    </span>',
                '  </a>',
                '  <a class="sb-public-admin-link" href="' + new URL('admin/', window.location.href).href + '" aria-label="Go to admin page">',
                '    ' + sbIconHtml('settings', 'sb-public-admin-icon', 18),
                '    <span>Admin</span>',
                '  </a>',
                '</div>'
            ].join('');
            document.body.insertBefore(header, document.body.firstChild);
        }

        function publicBuildHero(titleEl, isResult) {
            if (!titleEl || titleEl.closest('.sb-public-hero')) return;

            var hero = document.createElement('div');
            hero.className = 'sb-public-hero';
            var subtitle = document.createElement('p');
            subtitle.className = 'sb-public-subtitle';

            if (isResult) {
                titleEl.textContent = 'Link shortened';
                subtitle.textContent = 'Your short URL is ready to copy or share.';
            } else {
                titleEl.textContent = 'Shorten a link';
                subtitle.textContent = 'Paste a long URL and get a short link instantly.';
            }

            titleEl.classList.add('sb-public-title');
            titleEl.parentNode.insertBefore(hero, titleEl);
            hero.appendChild(titleEl);
            hero.appendChild(subtitle);
            return hero;
        }

        function publicBuildLandingLayout(hero, primaryEl, isResult) {
            if (!hero || !primaryEl || document.querySelector('.sb-public-landing')) return;

            var landing = document.createElement('section');
            landing.className = 'sb-public-landing';

            var copy = document.createElement('div');
            copy.className = 'sb-public-copy';

            var workspace = document.createElement('div');
            workspace.className = 'sb-public-workspace';

            var panel = document.createElement('aside');
            panel.className = 'sb-public-insight-panel';
            panel.setAttribute('aria-label', 'Short link workflow');
            panel.innerHTML = [
                '<div class="sb-public-panel-top">',
                '  <span class="sb-public-panel-icon" aria-hidden="true">' + sbIconHtml('bolt', 'sb-public-panel-symbol', 24) + '</span>',
                '  <div>',
                '    <strong>' + (isResult ? 'Ready to share' : 'Fast internal sharing') + '</strong>',
                '    <span>' + (isResult ? 'Copy the new short URL or open it now.' : 'Create a clean LINK-KUSCC URL for documents, chats and QR codes.') + '</span>',
                '  </div>',
                '</div>',
                '<div class="sb-public-link-preview">',
                '  <span>apps2.coop.ku.ac.th</span>',
                '  <strong>/go/your-link</strong>',
                '</div>',
                '<div class="sb-public-step-list">',
                '  <span><b>1</b> Paste URL</span>',
                '  <span><b>2</b> Pick keyword</span>',
                '  <span><b>3</b> Share link</span>',
                '</div>'
            ].join('');

            hero.parentNode.insertBefore(landing, hero);
            landing.appendChild(copy);
            copy.appendChild(hero);
            landing.appendChild(workspace);
            workspace.appendChild(primaryEl);
            workspace.appendChild(panel);
        }

        function publicHideNote() {
            document.querySelectorAll('h2').forEach(function (h2) {
                if (h2.textContent.trim().toLowerCase().indexOf('please note') === -1) return;
                h2.style.display = 'none';
                var next = h2.nextElementSibling;
                if (next && next.tagName === 'P') next.style.display = 'none';
            });
        }

        // 4. Tag the stock YOURLS public front page so the skin can lay it out.
        var publicForm = document.querySelector('form input[name="url"]');
        var hasBookmarklets = document.querySelector('a.bookmarklet');
        var publicResultHeading = publicDetectResultHeading();

        if (document.body && hasBookmarklets && !document.body.classList.contains('login')) {
            document.body.classList.add('public-site');
            if (publicResultHeading) document.body.classList.add('public-result');
            publicBuildHeader();

            var shortenForm = publicForm ? publicForm.closest('form') : null;
            if (shortenForm) {
                shortenForm.classList.add('sb-public-form');

                var urlField = shortenForm.querySelector('input[name="url"], input#url, input#add-url');
                var keywordField = shortenForm.querySelector('input[name="keyword"], input#keyword, input#add-keyword');
                var titleField = shortenForm.querySelector('input[name="title"], input#title, input#add-title');
                var submitField = shortenForm.querySelector('input[type="submit"], button[type="submit"]');

                if (urlField) {
                    sbSetupUrlInputPlaceholder(urlField, 'https://');
                    publicRestructureFieldRow(urlField, 'URL', 'sb-public-url-row');
                }
                if (keywordField) {
                    publicRestructureKeywordRow(keywordField);
                    sbSetupKeywordFieldRules(keywordField, shortenForm);
                }
                if (titleField) {
                    publicRestructureFieldRow(titleField, 'Title (optional)', 'sb-public-title-row');
                }
                if (urlField && titleField && window._sbPublicTitleNonce) {
                    var publicNonceEl = document.getElementById('nonce-add');
                    if (!publicNonceEl) {
                        publicNonceEl = document.createElement('input');
                        publicNonceEl.type = 'hidden';
                        publicNonceEl.id = 'nonce-add';
                        publicNonceEl.name = 'nonce';
                        publicNonceEl.value = window._sbPublicTitleNonce;
                        shortenForm.appendChild(publicNonceEl);
                    }
                    sbSetupTitleSuggestion(urlField, titleField, function () {
                        return publicNonceEl.value;
                    });
                }
                if (submitField) {
                    var submitRow = submitField.closest('p, div');
                    if (submitRow) submitRow.classList.add('sb-public-submit-row');
                    if (submitField.tagName === 'INPUT') {
                        sbEnhanceInputButton(submitField, 'link', 'Shorten', 'sb-input-btn-wrap--public-submit');
                        var submitWrap = submitField.closest('.sb-input-btn-wrap');
                        if (submitWrap) submitWrap.classList.add('sb-input-btn-wrap--public-submit');
                    }
                }

                if (urlField && keywordField) {
                    var publicKeywordTouched = keywordField.value.trim().length > 0;
                    var publicSuggestTimer = null;

                    function publicCleanKeywordPart(value) {
                        if (!value) return '';
                        try { value = decodeURIComponent(value.replace(/\+/g, ' ')); } catch (e) {}
                        if (value.normalize) value = value.normalize('NFKD');
                        value = value
                            .toLowerCase()
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/\.[a-z0-9]+$/i, '')
                            .replace(/[^a-z0-9]+/g, ' ')
                            .trim();

                        return value.split(/\s+/).filter(function (word) {
                            return word.length > 2 && !/^\d+$/.test(word) && ['http', 'https', 'www', 'go', 'link', 'links', 'index', 'home', 'kuscc'].indexOf(word) === -1;
                        }).slice(0, 4).join('');
                    }

                    function publicHash(value) {
                        var hash = 0;
                        for (var i = 0; i < value.length; i++) {
                            hash = ((hash << 5) - hash) + value.charCodeAt(i);
                            hash |= 0;
                        }
                        return Math.abs(hash).toString(36).substring(0, 4);
                    }

                    function publicParseUrl(value) {
                        value = value.trim();
                        if (!value) return null;
                        try {
                            return new URL(value);
                        } catch (e) {
                            try { return new URL('https://' + value.replace(/^\/+/, '')); } catch (err) {}
                        }
                        return null;
                    }

                    function publicSuggestKeyword(value) {
                        var parsed = publicParseUrl(value);
                        if (!parsed) return '';

                        var segments = parsed.pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
                        for (var i = segments.length - 1; i >= 0; i--) {
                            var fromPath = publicCleanKeywordPart(segments[i]);
                            if (fromPath && fromPath.length >= 4) return fromPath.substring(0, KEYWORD_MAX_LENGTH);
                        }

                        var fromTitle = publicCleanKeywordPart(parsed.searchParams.get('title') || parsed.searchParams.get('name') || parsed.searchParams.get('q') || '');
                        if (fromTitle && fromTitle.length >= 4) return fromTitle.substring(0, KEYWORD_MAX_LENGTH);

                        var fromHost = publicCleanKeywordPart(parsed.hostname.replace(/^www\./, '').split('.')[0]);
                        if (!fromHost) fromHost = 'link';
                        return (fromHost.substring(0, 14) + publicHash(value)).substring(0, KEYWORD_MAX_LENGTH);
                    }

                    function publicApplySuggestion(force) {
                        if (publicKeywordTouched && !force) return;
                        var suggestion = publicSuggestKeyword(urlField.value);
                        if (!suggestion) return;
                        keywordField.value = suggestion;
                        keywordField.classList.add('sb-kw-suggested');
                        setTimeout(function () { keywordField.classList.remove('sb-kw-suggested'); }, 900);
                    }

                    urlField.addEventListener('input', function () {
                        if (publicSuggestTimer) clearTimeout(publicSuggestTimer);
                        publicSuggestTimer = setTimeout(function () { publicApplySuggestion(false); }, 300);
                    });
                    urlField.addEventListener('blur', function () { publicApplySuggestion(false); });
                    keywordField.addEventListener('input', function () {
                        publicKeywordTouched = keywordField.value.trim().length > 0;
                    });
                }
            }

            var publicTitle = null;
            document.querySelectorAll('h2').forEach(function (h2) {
                var text = h2.textContent.trim().toLowerCase();
                if (!publicTitle && text.indexOf('enter a new url') !== -1) {
                    publicTitle = h2;
                }
            });
            var publicHero = publicTitle ? publicBuildHero(publicTitle, false) : null;
            if (publicHero && shortenForm) publicBuildLandingLayout(publicHero, shortenForm, false);

            document.querySelectorAll('h2').forEach(function (h2) {
                var text = h2.textContent.trim().toLowerCase();
                if (text.indexOf('bookmarklets') !== -1) {
                    h2.classList.add('sb-public-section-title', 'sb-bookmarklets-title');
                    var intro = h2.nextElementSibling;
                    var links = intro ? intro.nextElementSibling : null;
                    if (intro) intro.classList.add('sb-bookmarklet-intro');
                    if (links) links.classList.add('sb-bookmarklet-list');
                }
            });
            publicHideNote();

            if (publicResultHeading && !publicResultHeading.dataset.sbResultEnhanced) {
                publicResultHeading.dataset.sbResultEnhanced = '1';
                publicHideShareboxes();

                var isExisting = publicResultIsExisting(publicResultHeading);
                var shortUrlInput = document.getElementById('short_url');
                var copyLinkInput = document.getElementById('copylink');
                var shortValue = publicParseResultUrl(publicResultHeading, shortUrlInput, copyLinkInput);

                publicResultHeading.classList.add('sb-public-result-title');
                publicResultHeading.textContent = '';
                if (shortValue) {
                    var urlLink = document.createElement('a');
                    urlLink.href = shortValue;
                    urlLink.textContent = shortValue;
                    urlLink.rel = 'noopener';
                    publicResultHeading.appendChild(urlLink);
                }

                var resultCard = document.createElement('section');
                resultCard.className = 'sb-public-result-card';
                if (isExisting) resultCard.classList.add('sb-public-result-card--existing');

                var icon = document.createElement('div');
                icon.className = 'sb-public-result-icon';
                if (!isExisting) {
                    icon.setAttribute('aria-hidden', 'true');
                    icon.innerHTML = sbIconHtml('check_circle', 'sb-public-result-symbol', 28);
                }

                var body = document.createElement('div');
                body.className = 'sb-public-result-body';

                if (isExisting) {
                    var notice = document.createElement('div');
                    notice.className = 'sb-public-result-notice';
                    notice.innerHTML = sbIconHtml('info', 'sb-public-result-notice-icon', 20)
                        + '<span>No new link was created. The URL you entered was shortened before.</span>';
                    body.appendChild(notice);
                }

                var label = document.createElement('div');
                label.className = 'sb-public-result-label';
                label.textContent = isExisting ? 'Existing short URL' : 'Short URL created';

                publicResultHeading.parentNode.insertBefore(resultCard, publicResultHeading);
                if (!isExisting) resultCard.appendChild(icon);
                resultCard.appendChild(body);
                body.appendChild(label);
                body.appendChild(publicResultHeading);

                if (shortValue) {
                    body.appendChild(publicBuildResultQr(shortValue));

                    var actions = document.createElement('div');
                    actions.className = 'sb-public-result-actions';

                    var openLink = document.createElement('a');
                    openLink.className = 'sb-public-result-open';
                    openLink.href = shortValue;
                    openLink.target = '_blank';
                    openLink.rel = 'noopener';
                    openLink.innerHTML = sbIconHtml('open_in_new', 'sb-public-result-btn-icon', 18) + '<span>Open short URL</span>';

                    var copyButton = document.createElement('button');
                    copyButton.type = 'button';
                    copyButton.className = 'sb-public-result-copy';
                    copyButton.innerHTML = sbIconHtml(ICON_COPY, 'sb-public-result-btn-icon', 18) + '<span>Copy</span>';
                    copyButton.addEventListener('click', function () {
                        copyTextToClipboard(shortValue, function () {
                            copyButton.innerHTML = sbIconHtml(ICON_CHECK, 'sb-public-result-btn-icon', 18) + '<span>Copied</span>';
                            setTimeout(function () {
                                copyButton.innerHTML = sbIconHtml(ICON_COPY, 'sb-public-result-btn-icon', 18) + '<span>Copy</span>';
                            }, 1400);
                        });
                    });

                    var anotherLink = document.createElement('a');
                    anotherLink.className = 'sb-public-result-another';
                    anotherLink.href = window.location.pathname;
                    anotherLink.innerHTML = sbIconHtml('add_link', 'sb-public-result-btn-icon', 18) + '<span>Shorten another link</span>';

                    actions.appendChild(openLink);
                    actions.appendChild(copyButton);
                    body.appendChild(actions);
                    body.appendChild(anotherLink);
                }

                publicBuildResultShell(resultCard, { existing: isExisting });
            }
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

        var perPageInput = filterOptions ? filterOptions.querySelector('input[name="perpage"]') : null;
        if (perPageInput && !perPageInput.dataset.sbPerpageDone) {
            var perPageSelect = document.createElement('select');
            perPageSelect.name = perPageInput.name;
            perPageSelect.id = perPageInput.id || 'perpage';
            perPageSelect.className = perPageInput.className;
            perPageSelect.dataset.sbPerpageDone = '1';

            var currentPerPage = String(perPageInput.value || '15');
            ['15', '25', '50', '100'].forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                if (value === currentPerPage) option.selected = true;
                perPageSelect.appendChild(option);
            });

            if (!perPageSelect.value) {
                var customOption = document.createElement('option');
                customOption.value = currentPerPage;
                customOption.textContent = currentPerPage;
                customOption.selected = true;
                perPageSelect.insertBefore(customOption, perPageSelect.firstChild);
            }

            perPageInput.parentNode.replaceChild(perPageSelect, perPageInput);
        }

        // 5c. Rebuild filter panel into a structured card layout.
        if (filterOptions && !filterOptions.dataset.sbPanelDone) {
            filterOptions.dataset.sbPanelDone = '1';
            var filterForm = document.getElementById('filter_form');
            if (filterForm) {
                filterForm.classList.add('sb-filter-panel');
                if (!filterForm.querySelector('.sb-filter-header')) {
                    var filterHeader = document.createElement('div');
                    filterHeader.className = 'sb-filter-header';
                    filterHeader.innerHTML = '<span class="sb-filter-header-icon">' + sbIconHtml('search', '', 20) + '</span><span class="sb-filter-header-title">Filter &amp; search links</span>';
                    filterForm.insertBefore(filterHeader, filterForm.firstChild);
                }
            }

            function makeFilterHint(text) {
                var hint = document.createElement('span');
                hint.className = 'sb-filter-hint';
                hint.textContent = text;
                return hint;
            }

            function makeFilterGroup(className, labelText, elements) {
                var group = document.createElement('div');
                group.className = 'sb-filter-group ' + className;
                if (labelText) {
                    var label = document.createElement('span');
                    label.className = 'sb-filter-label';
                    label.textContent = labelText;
                    group.appendChild(label);
                }
                var controls = document.createElement('div');
                controls.className = 'sb-filter-controls';
                elements.forEach(function (el) {
                    if (el) controls.appendChild(el);
                });
                group.appendChild(controls);
                return group;
            }

            function getFilterField(selector) {
                return filterOptions.querySelector(selector);
            }

            var searchField = getFilterField('input[name="search"]');
            var searchInField = getFilterField('select[name="search_in"]');
            var sortByField = getFilterField('select[name="sort_by"]');
            var sortOrderField = getFilterField('select[name="sort_order"]');
            var perpageField = getFilterField('select[name="perpage"], input[name="perpage"]');
            var clickFilterField = getFilterField('select[name="click_filter"]');
            var clickLimitField = getFilterField('input[name="click_limit"]');
            var dateFilterField = getFilterField('select[name="date_filter"]');
            var dateFirstField = getFilterField('input[name="date_first"]');
            var dateAndSpan = document.getElementById('date_and');
            var dateSecondField = getFilterField('input[name="date_second"]');
            var filterButtons = document.getElementById('filter_buttons');

            var primaryGrid = document.createElement('div');
            primaryGrid.className = 'sb-filter-grid sb-filter-grid-primary';
            if (searchField) primaryGrid.appendChild(makeFilterGroup('sb-filter-group-search', 'Search', [searchField]));
            if (searchInField) primaryGrid.appendChild(makeFilterGroup('sb-filter-group-search-in', 'In', [searchInField]));

            var optionsGrid = document.createElement('div');
            optionsGrid.className = 'sb-filter-grid sb-filter-grid-options';
            if (sortByField) optionsGrid.appendChild(makeFilterGroup('sb-filter-group-sort-by', 'Sort by', [sortByField]));
            if (sortOrderField) optionsGrid.appendChild(makeFilterGroup('sb-filter-group-sort-order', 'Order', [sortOrderField]));
            if (perpageField) optionsGrid.appendChild(makeFilterGroup('sb-filter-group-perpage', 'Per page', [perpageField]));

            var advancedSection = document.createElement('div');
            advancedSection.className = 'sb-filter-advanced sb-filter-advanced-open';
            var advancedToggle = document.createElement('button');
            advancedToggle.type = 'button';
            advancedToggle.className = 'sb-filter-advanced-toggle';
            advancedToggle.setAttribute('aria-expanded', 'true');
            advancedToggle.innerHTML = sbIconHtml('tune', '', 18) + '<span>Advanced filters</span><span class="sb-filter-advanced-caret">' + sbIconHtml('expand_more', '', 18) + '</span>';
            advancedToggle.addEventListener('click', function () {
                var open = advancedSection.classList.toggle('sb-filter-advanced-open');
                advancedToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });

            var advancedGrid = document.createElement('div');
            advancedGrid.className = 'sb-filter-grid sb-filter-grid-advanced';

            if (clickFilterField || clickLimitField) {
                var clicksControls = document.createElement('div');
                clicksControls.className = 'sb-filter-controls sb-filter-controls-inline';
                if (clickFilterField) {
                    clicksControls.appendChild(makeFilterHint('with'));
                    clicksControls.appendChild(clickFilterField);
                }
                if (clickLimitField) {
                    clicksControls.appendChild(makeFilterHint('than'));
                    clicksControls.appendChild(clickLimitField);
                    clicksControls.appendChild(makeFilterHint('clicks'));
                }
                var clicksGroup = document.createElement('div');
                clicksGroup.className = 'sb-filter-group sb-filter-group-clicks';
                var clicksLabel = document.createElement('span');
                clicksLabel.className = 'sb-filter-label';
                clicksLabel.textContent = 'Clicks';
                clicksGroup.appendChild(clicksLabel);
                clicksGroup.appendChild(clicksControls);
                advancedGrid.appendChild(clicksGroup);
            }

            if (dateFilterField || dateFirstField || dateSecondField) {
                var dateControls = document.createElement('div');
                dateControls.className = 'sb-filter-controls sb-filter-controls-inline';
                if (dateFilterField) dateControls.appendChild(dateFilterField);
                if (dateFirstField) dateControls.appendChild(dateFirstField);
                if (dateAndSpan) dateControls.appendChild(dateAndSpan);
                if (dateSecondField) dateControls.appendChild(dateSecondField);

                var dateGroup = document.createElement('div');
                dateGroup.className = 'sb-filter-group sb-filter-group-date';
                var dateLabel = document.createElement('span');
                dateLabel.className = 'sb-filter-label';
                dateLabel.textContent = 'Created';
                dateGroup.appendChild(dateLabel);
                dateGroup.appendChild(dateControls);
                advancedGrid.appendChild(dateGroup);
            }

            advancedSection.appendChild(advancedToggle);
            advancedSection.appendChild(advancedGrid);

            var actionsBar = document.createElement('div');
            actionsBar.className = 'sb-filter-actions';
            if (filterButtons) actionsBar.appendChild(filterButtons);

            while (filterOptions.firstChild) {
                filterOptions.removeChild(filterOptions.firstChild);
            }
            filterOptions.appendChild(primaryGrid);
            filterOptions.appendChild(optionsGrid);
            if (advancedGrid.childNodes.length) filterOptions.appendChild(advancedSection);
            filterOptions.appendChild(actionsBar);

            if (filterButtons) {
                var searchBtn = filterButtons.querySelector('#submit-sort');
                var clearBtn = filterButtons.querySelector('#submit-clear-filter');
                if (searchBtn) sbEnhanceInputButton(searchBtn, 'search');
                if (clearBtn) sbEnhanceInputButton(clearBtn, 'filter_alt_off');
            }
        }

        sbEnhanceDialogButtons(document);
        sbWatchDeleteDialogLayout();

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
                '#delete-confirm-dialog:not([open]){display:none!important;}',
                '#delete-confirm-dialog[open]{',
                '  display:flex!important;flex-direction:column!important;',
                '  width:min(calc(100vw - 40px),480px)!important;',
                '  height:fit-content!important;min-height:0!important;max-height:calc(100vh - 40px);',
                '  padding:0!important;overflow:hidden!important;box-sizing:border-box!important;',
                '  border:1px solid var(--sb-border)!important;',
                '  border-radius:var(--sb-radius)!important;',
                '  background:var(--sb-surface)!important;color:var(--sb-text)!important;',
                '  box-shadow:var(--sb-shadow-lg)!important;',
                '}',
                '#delete-confirm-dialog::backdrop{',
                '  background:rgba(15,23,42,.45)!important;',
                '  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);',
                '}',
                '#delete-confirm-dialog > div[name="dialog_title"]{',
                '  width:auto!important;height:auto!important;margin:0!important;',
                '  padding:14px 20px!important;border:0!important;border-radius:0!important;',
                '  background:var(--sb-accent)!important;color:#fff!important;',
                '  font-size:15px!important;font-weight:700!important;text-align:left!important;',
                '}',
                '#delete-confirm-dialog .confirm-message,',
                '#delete-confirm-dialog div.confirm-message{',
                '  flex:0 0 auto!important;width:100%!important;max-width:none!important;',
                '  height:auto!important;min-height:0!important;float:none!important;',
                '  padding:20px 24px!important;background:var(--sb-surface)!important;',
                '  color:var(--sb-text)!important;overflow:visible!important;',
                '}',
                '#delete-confirm-dialog .confirm-message ul{',
                '  margin:16px 0 0!important;padding:0!important;border:0!important;',
                '  list-style:none!important;display:grid;gap:10px;',
                '}',
                '#delete-confirm-dialog .confirm-message ul li span{',
                '  border:0!important;border-radius:0!important;padding:0!important;',
                '  background:transparent!important;color:var(--sb-text)!important;',
                '}',
                '#delete-confirm-dialog .button-group,',
                '#delete-confirm-dialog div.button-group{',
                '  flex:0 0 auto!important;width:100%!important;max-width:none!important;',
                '  height:auto!important;min-height:0!important;margin:0!important;',
                '  padding:16px 20px!important;box-sizing:border-box!important;',
                '  display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:10px!important;',
                '  float:none!important;clear:both!important;background:var(--sb-surface-muted)!important;',
                '  border:0!important;border-top:1px solid var(--sb-border)!important;',
                '}',
                '#delete-confirm-dialog .button-group input:focus{outline:none!important;}',
                '#delete-confirm-dialog .button-group input:focus-visible{',
                '  outline:2px solid var(--sb-accent)!important;outline-offset:2px!important;',
                '}',
                '#delete-confirm-dialog .button-group input.button.primary:focus-visible{',
                '  outline:2px solid #fff!important;',
                '  box-shadow:0 0 0 3px color-mix(in srgb,var(--sb-danger) 50%,transparent)!important;',
                '}',
                '#delete-confirm-dialog .button-group input[type=button],',
                '#delete-confirm-dialog .button-group input[type=reset],',
                '#delete-confirm-dialog .button-group input[type=submit]{',
                '  min-height:var(--sb-input-height)!important;margin:0!important;',
                '  padding-block:0!important;padding-inline:18px!important;',
                '  border-radius:var(--sb-input-radius)!important;',
                '  font-size:14px!important;font-weight:700!important;box-shadow:none!important;',
                '}',
                '#delete-confirm-dialog .sb-input-btn-wrap,',
                '.ui-dialog .button-group .sb-input-btn-wrap{',
                '  display:inline-grid;grid-template-areas:"btn";align-items:center;justify-items:stretch;',
                '}',
                '#delete-confirm-dialog .sb-input-btn-wrap > .sb-btn-icon,',
                '.ui-dialog .button-group .sb-input-btn-wrap > .sb-btn-icon{',
                '  grid-area:btn;justify-self:start;align-self:center;margin-left:14px;z-index:1;pointer-events:none;line-height:1;',
                '}',
                '#delete-confirm-dialog .sb-input-btn-wrap > input.sb-btn-has-icon,',
                '.ui-dialog .button-group .sb-input-btn-wrap > input.sb-btn-has-icon{',
                '  padding-left:38px!important;padding-right:18px!important;',
                '  line-height:var(--sb-input-height);text-align:center;',
                '}',
                '#delete-confirm-dialog .button-group input.button.primary,',
                '#delete-confirm-dialog .button-group input[type=button].primary{',
                '  border:0!important;background:var(--sb-danger)!important;color:#fff!important;',
                '}',
                '#delete-confirm-dialog .button-group input[type=reset],',
                '#delete-confirm-dialog .button-group input.button:not(.primary){',
                '  border:1px solid var(--sb-border)!important;',
                '  background:var(--sb-surface)!important;color:var(--sb-text-muted)!important;',
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
            var isError = color === 'fail' || color === 'error';
            t.className = 'sb-toast' + (isError ? ' sb-toast-error' : '');
            t.appendChild(sbIconEl(isError ? 'error' : 'check_circle', 'sb-toast-icon', 22));
            var text = document.createElement('span');
            text.textContent = msg;
            t.appendChild(text);
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
                    return candidates[0].keyword.substring(0, KEYWORD_MAX_LENGTH);
                }

                var fallback = '';
                try {
                    fallback = cleanCandidate(parseUrl(url).hostname.replace(/^www\./, '').split('.')[0]);
                } catch (e) {}
                if (!fallback) fallback = 'link';
                return (fallback.substring(0, 14) + stableHash(url)).substring(0, KEYWORD_MAX_LENGTH);
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

        // 6e. Admin title suggestion — fetch page title from URL for the add form.
        (function () {
            var adminTitleSuggestion = sbSetupTitleSuggestion(
                document.getElementById('add-url'),
                document.getElementById('add-title'),
                function () {
                    var nonceEl = document.getElementById('nonce-add');
                    return nonceEl ? nonceEl.value : '';
                }
            );

            if (adminTitleSuggestion) {
                window.sbAdminTitleResetTouched = adminTitleSuggestion.resetTouched;
            }
        }());

        // 7. Wrap the page h2 + optional description paragraph (no uk-container — keeps alignment with tables).
        var mainEl = document.querySelector('#wrap > main, body > main');
        if (mainEl) {
            var children = mainEl.children;
            var pageH2 = null;
            for (var i = 0; i < children.length; i++) {
                if (children[i].tagName === 'H2') { pageH2 = children[i]; break; }
            }
            if (pageH2) {
                var wrap = document.createElement('div');
                wrap.className = 'sb-page-header';
                pageH2.parentNode.insertBefore(wrap, pageH2);
                wrap.appendChild(pageH2);
                var next = wrap.nextElementSibling;
                if (next && next.tagName === 'P') { wrap.appendChild(next); }
            }
        }

    });
})();
