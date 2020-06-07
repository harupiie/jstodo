const todoList = [];
let inputForm, todoMain, tabButton, sortMenu;
let displayTarget = "inbox";
let sortIndex = "created-desc";

/** Todo一個単位のHTML文字列を生成する */
function createTodoHtmlString(todo) {
    let htmlString = "";
    const editType = todo.isEdit ? "editFixed" : "edit";
    const editButtonLabel = todo.isEdit ? "編集完了" : "編集";
    const doneType = todo.isDone ? "inbox" : "done";
    const doneButtonLabel = todo.isDone ? "未完了" : "完了";
    let todoTextCell, deadlineCell;
    if (todo.isEdit) {
        todoTextCell =
            '<td class="cell-text"><input class="input-edit" type="text" value=' +
            todo.text +
            " /></td>";
        deadlineCell =
            '<td class="cell-deadline-at"><input class="input-deadline" type="date" value=' +
            todo.deadlineAt +
            " /></td>";
    } else {
        todoTextCell = '<td class="cell-text">' + todo.text + "</td>";
        deadlineCell = '<td class="cell-deadline-at">' + todo.deadlineAt + "</td>";
    }
    // HTML生成
    htmlString += '<tr id="' + todo.id + '">';
    htmlString +=
        '<td class="cell-edit-button"><button data-type="' +
        editType +
        '">' +
        editButtonLabel +
        "</button></td>";
    htmlString += todoTextCell;
    htmlString += '<td class="cell-created-at">' + todo.createdAt + "</td>";
    htmlString += deadlineCell;
    htmlString += '<td class="cell-done">';
    htmlString += '<button data-type="' + doneType + '">';
    htmlString += doneButtonLabel;
    htmlString += "</button></td>";
    htmlString += '<td class="cell-delete"><button data-type="delete">削除</button></td>';
    htmlString += "</tr>";
    // HTML文字列をリターン
    return htmlString;
}

// 完了ステート変更
function updateTodoState(todo, type) {
    //isDoneに、type="done"ならtrue、それ以外はfalseをセット
    todo.isDone = type === "done";
    // HTML再描画
    updateTodoList();
}

// ソート処理
function sortTodos(a, b) {
    switch (sortIndex) {
        case "created-desc":
            return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        case "created-asc":
            return Date.parse(a.createdAt) - Date.parse(b.createdAt);
        case "deadline-desc":
            return Date.parse(b.deadlineAt) - Date.parse(a.deadlineAt);
        case "deadline-asc":
            return Date.parse(a.deadlineAt) - Date.parse(b.deadlineAt);
        default:
            return todoList;
    }
}

// 編集処理
function editTodo(todo, type) {
    // isEditに、type="edit"ならtrue, それ以外ならfalseをセット
    todo.isEdit = type === "edit";
    updateTodoList();
}

// 削除処理
function deleteTodo(todo) {
    // ToDoオブジェクトの配列インデックスを取得
    const index = todoList.findIndex((t) => t.id === todo.id);
    // 配列から削除
    todoList.splice(index, 1);
}

// ToDoリスト一覧更新
function updateTodoList() {
    let htmlStrings = "";
    // HTMLを書き換える
    todoList
        // 未完了のToDoのみ抽出するフィルタを設定
        .filter(todo => todo.isDone !== (displayTarget === "inbox"))
        // ソートを行う
        .sort(sortTodos)
        .forEach(todo => {
            // HTML出力
            htmlStrings += createTodoHtmlString(todo);
            todoMain.innerHTML = htmlStrings;
        })
    todoMain.innerHTML = htmlStrings;

    // trタグのtodoオブジェクトidを拾いidが存在したらボタンにクリックイベントを設定する
    todoList
        .filter(todo => todo.isDone !== (displayTarget === "inbox"))
        .forEach(todo => {
            const todoEl = document.getElementById(todo.id);
            if (todoEl) {
                todoEl.querySelectorAll("button").forEach(btn => {
                    const type = btn.dataset.type;
                    // ボタン未完了or完了ならupdateTodoStateを呼び出す
                    btn.addEventListener("click", event => {
                        if (type.indexOf("edit") >= 0) {
                            editTodo(todo, type);
                        } else if (type.indexOf("delete") >= 0) {
                            deleteTodo(todo);
                            updateTodoState(todo, type);                        
                        } else {
                            updateTodoState(todo, type);
                        }
                    })
                })
                // 編集状態の場合はテキストフィールドにイベントをバインドする
                if (todo.isEdit) {
                    todoEl.querySelector(".input-edit").addEventListener("input", event => {
                        todo.text = event.currentTarget.value;
                    })
                    todoEl
                        .querySelector(".input-deadline")
                        .addEventListener("input", event => {
                            if (event.currentTarget.value) {
                                todo.deadlineAt = new Date(event.currentTarget.value).toLocaleDateString();
                            } else {
                                todo.deadlineAt = "";
                            }
                        })
                }
            }
        })
}

// フォームをクリアする 
function clearInputForm() {
    inputForm["input-text"].value = "";
    inputForm["input-deadline"].value = "";
}

// ToDoオブジェクトに値を追加
function addTodo(todoObj) {
    todoObj.id = "todo-" + (todoList.length + 1);
    todoObj.createdAt = new Date().toLocaleDateString();
    todoObj.isDone = false;
    todoObj.isEdit = false;
    todoList.unshift(todoObj)  // todoList配列の先頭に挿入;
    // HTML生成
    updateTodoList();
    // フォームの初期化
    clearInputForm();
}

// ToDo登録
function handleSubmit(event) {
    event.preventDefault(); //ブラウザのデフォルトの挙動を停止しリロード回避
    let vDeadline;
    if (inputForm["input-deadline"].value) {
        vDeadline = new Date(inputForm["input-deadline"].value).toLocaleDateString();
    } else {
        vDeadline = "";
    }
    const todoObj = {
        text: inputForm["input-text"].value,
        deadlineAt: vDeadline
    };
    addTodo(todoObj);
}

// タブクリック
function handleTabClick(event) {
    // イベントが発生した要素からタブのボタンの表示文字列を取得し、グローバル変数displayTargetに保存。
    const me = event.currentTarget;
    displayTarget = me.dataset.target;
    // HTML再描画
    updateTodoList();
}

// ソート
function handleSort(e) {
    sortIndex = e.currentTarget.value;
    updateTodoList();
}

// DOM取得
function registerDOM() {
    inputForm = document.querySelector("#input-form");
    todoMain = document.querySelector("#todo-main");
    tabButton = document.querySelector("#tab").querySelectorAll("button");
    sortMenu = document.querySelector("#sort-menu");
}

// ToDo登録、タブクリック、ソートイベントをhandle関数にバインド
function bindEvents() {
    inputForm.addEventListener("submit", event => handleSubmit(event));
    tabButton.forEach(tab => {
        tab.addEventListener("click", event => handleTabClick(event));
    })
    sortMenu.addEventListener("change", event => handleSort(event));
}

// 初期化
function initialize() {
    registerDOM();
    bindEvents();
    updateTodoList();
}

// ブラウザのページ解析完了時に走る
document.addEventListener("DOMContentLoaded", initialize.bind(this));


