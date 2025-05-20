@echo off
echo ==== Limpando Instalação Corrompida do Expo ====
echo.

echo 1. Parando processos Metro...
taskkill /f /im node.exe

echo 2. Removendo node_modules...
rmdir /s /q node_modules
if %errorlevel% neq 0 echo Aviso: Não foi possível remover node_modules, talvez já tenha sido removido.

echo 3. Removendo cache e arquivos de bloqueio...
del /f /q package-lock.json
if %errorlevel% neq 0 echo Aviso: package-lock.json não encontrado.
del /f /q yarn.lock
if %errorlevel% neq 0 echo Aviso: yarn.lock não encontrado.
rmdir /s /q .expo
if %errorlevel% neq 0 echo Aviso: Pasta .expo não encontrada.

echo 4. Limpando cache do npm...
call npm cache clean --force
if %errorlevel% neq 0 echo Erro ao limpar cache do npm, continuando mesmo assim...

echo 5. Instalando dependências do metro...
call npm install metro metro-core metro-source-map metro-resolver metro-runtime
if %errorlevel% neq 0 echo Erro ao instalar dependências do metro, continuando mesmo assim...

echo 6. Reinstalando todas as dependências...
call npm install
if %errorlevel% neq 0 (
  echo Falha ao reinstalar dependências.
  echo Tentando reinstalar o expo especificamente...
  call npm install expo@^52.0.0
  call npm install
)

echo 7. Instalando expo-cli globalmente...
call npm install -g expo-cli
if %errorlevel% neq 0 echo Aviso: Não foi possível instalar expo-cli globalmente, talvez já esteja instalado.

echo.
echo ==== Limpeza Concluída ====
echo.
echo Agora tente iniciar seu projeto com:
echo npx expo start --clear
echo.
echo Se o problema persistir, considere a opção de criar um novo projeto e copiar seus arquivos.
echo.
pause