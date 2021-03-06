import loader from '../control/load.js';
import validate from '../control/validation.js';

class ModalPopup {
    init(id, title, modal) {
        this._id = id;
        this._title = title;
        this._modal = modal;
    }
}

class ModalAjax extends ModalPopup {
    init(id, url, title, modal, failed_msg) {
        super.init(id, title, modal);
        this._url = url;
        this._failed_msg = failed_msg;
        this.load();
    }

    load() {
        loader.load_page(this._url)
        .then((data) => {
                // add header
                this._modal.innerHTML = `
                    <div class="modal-header bg-primary text-light border-0">
                        <h5 class="modal-title">${ this._title }</h5>
                        <button type="button" class="close btn-primary" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true" class="text-light">&times;</span>
                        </button>
                    </div>
                `;
                // modal.innerHTML += data;     cannot run the script in the middle
                // used this to prevent script not running while appending html
                let frag =  document.createRange().createContextualFragment(data); 
                this._modal.appendChild(frag);
                
                validate.updateValidation();
            })
            .catch((message) => {
                console.error(message);
                this._modal.innerHTML = this._failedMsg;
            });
    }
}

class ModalConfirm extends ModalPopup {
    init(id, title, modal, confirm_msg, dest_link) {
        super.init(id, title, modal);
        this._confirm_msg = confirm_msg;
        this._dest_link = dest_link;
        this.load();
    }

    load() {
        this._modal.innerHTML = `
            <div class="modal-header bg-primary text-light border-0">
                <h5 class="modal-title">${ this._title }</h5>
                <button type="button" class="close btn-primary" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="text-light">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                ${ this._confirm_msg }
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Batalkan</button>
                <a href="${ this._dest_link }" class="btn btn-primary">Lanjutkan</a>
            </div>
        `;
    }
}

class ModalGenre extends ModalAjax {
    
}

class ModalSong extends ModalAjax {
    
}

class ModalLyric extends ModalAjax {
    
}

class ModalSubLyric extends ModalAjax {
    set parent(parentRow) {
        this._parentRow = parentRow;
    }

    addRows() {
        let countChild = this._parentRow.childElementCount + 1;
        let itemChild = `
            <div id="itemRow_${countChild}" class="form-row mb-3">
                <label for="language" class="col-md-2 col-form-label text-md-center">${countChild}</label>
                <div class="col-md-8">
                    <input id="lyric_content_${countChild}" type="text" class="form-control" name="lyric_content[]" onpaste="ModalHandler_SubLyric.pasteMultiLine(this, event);" required>
                    <div class="invalid-feedback">
                        Harus diisi.
                    </div>
                </div>
                <button id="deleteRow" id-parent="itemRow_${countChild}" type="button" class="btn btn-danger col-md-2 mt-2 mt-md-0" onclick="ModalHandler_SubLyric.deleteRows(this);">Hapus</button>
            </div>
        `;
    
        let frag =  document.createRange().createContextualFragment(itemChild); 
        this._parentRow.appendChild(frag);
    };

    deleteRows(button) {
        let removeElement = this._parentRow.querySelector("#" + button.getAttribute("id-parent"));
        this._parentRow.removeChild(removeElement);
        this.updateNumber();
    };

    updateNumber() {
        let labelNumber = this._parentRow.querySelectorAll("label");
        for(let i=0; i < labelNumber.length; i++) {
            labelNumber[i].innerText = i+1;
            labelNumber[i].id = `lyric_content_${i+1}`;
        }
    };

    pasteMultiLine(el, event) {
        const oldValue = el.value;
        const clipData = event.clipboardData || window.clipboardData || event.originalEvent.clipboardData;
        const pastedData = clipData.getData('Text');
        const arrayData = pastedData.split('\n');
        let currentParentNode = el.parentNode.parentNode;
        let siblings = [];
        while(currentParentNode = currentParentNode.nextElementSibling) {
            siblings.push(currentParentNode.querySelector('input'));
        }
        siblings.forEach((item, index) => {
            if(arrayData[index+1] !== undefined) {
                item.value = arrayData[index+1];
            }
        });
        setTimeout(() => {
            el.value = oldValue + arrayData[0];
        }, 4);
    }
}

export default {
    ModalConfirm,
    ModalGenre,
    ModalSong,
    ModalLyric,
    ModalSubLyric,
}